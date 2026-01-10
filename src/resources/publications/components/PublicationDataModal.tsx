import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Modal,
  Typography,
  Divider,
  TextField,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Close, Visibility, Save, Add, CloudUpload, Delete } from '@mui/icons-material';
import { syncAddRelated } from 'utils/helpers/syncRelatedPublications';
import { resizeToA4 } from 'utils/helpers/resizeToA4';
import { supabase } from 'lib/supabase';
import {
  useTranslate,
  useRedirect,
  useGetOne,
  useGetList,
  useCreate,
  useUpdate,
  useNotify,
} from 'react-admin';

import { ModalContent, ModalWrapper } from 'components/UI';
import { STOREGE_URL, Tables } from 'types';
import { toArabicNumerals } from 'utils';

interface PublicationDataModalProps {
  open: boolean;
  onClose: () => void;
  publicationData: Tables<'publications'> | null;
}

export const PublicationDataModal = ({
  open,
  onClose,
  publicationData,
}: PublicationDataModalProps) => {
  const translate = useTranslate();
  const redirect = useRedirect();
  const notify = useNotify();
  const [create, { isPending: isCreating }] = useCreate();
  const [update] = useUpdate();
  const [pages, setPages] = useState(publicationData?.pages || 0);
  const [paperTypeId, setPaperTypeId] = useState(publicationData?.paper_type_id || '');
  const [additionalData, setAdditionalData] = useState(publicationData?.additional_data || '');
  const [doRound, setDoRound] = useState(publicationData?.do_round || false);
  const [coverless, setCoverless] = useState(publicationData?.coverless || false);
  const [twoFacesCover, setTwoFacesCover] = useState(publicationData?.two_faces_cover || false);
  const [createdCount, setCreatedCount] = useState(0);
  const [localPublicationData, setLocalPublicationData] = useState(publicationData);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setCoverFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);
    }
  }, []);

  // Handle paste event for cover image
  useEffect(() => {
    if (!open) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          if (blob) {
            const file = new File([blob], `pasted-image-${Date.now()}.png`, {
              type: blob.type,
            });
            handleFileSelect(file);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [open, handleFileSelect]);

  // Cleanup preview URL on unmount or when cover changes
  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  // Upload cover to Supabase storage
  const uploadCover = async (file: File): Promise<string | null> => {
    try {
      const resizedBlob = await resizeToA4(file);
      const fileName = `/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { data: cover, error } = await supabase.storage
        .from('covers')
        .upload(fileName, resizedBlob);

      if (error) {
        console.error('Cover upload error:', error);
        return null;
      }

      return `${STOREGE_URL}${cover?.fullPath}`;
    } catch (error) {
      console.error('Cover resize/upload error:', error);
      return null;
    }
  };

  // Sync state when publicationData or open changes
  useEffect(() => {
    if (open && publicationData) {
      setPages(publicationData.pages || 0);
      setPaperTypeId(publicationData.paper_type_id || '');
      setAdditionalData(publicationData.additional_data || '');
      setDoRound(publicationData.do_round || false);
      setCoverless(publicationData.coverless || false);
      setTwoFacesCover(publicationData.two_faces_cover || false);
      setCreatedCount(0);
      setLocalPublicationData(publicationData);
      setCoverFile(null);
      setCoverPreview(null);
    }
  }, [open, publicationData]);

  // Auto-disable twoFacesCover when coverless is true
  useEffect(() => {
    if (coverless) {
      setTwoFacesCover(false);
    }
  }, [coverless]);

  const { data: subject } = useGetOne(
    'subjects',
    { id: publicationData?.subject_id || '' },
    { enabled: !!publicationData?.subject_id }
  );

  const { data: publisher } = useGetOne(
    'publishers',
    { id: publicationData?.publisher_id || '' },
    { enabled: !!publicationData?.publisher_id }
  );

  const { data: paperTypes } = useGetList('paper_types', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'name', order: 'ASC' },
  });

  if (!publicationData) return null;

  const resetFormForNext = () => {
    setPages(0);
    setAdditionalData('');
    setDoRound(false);
    setCoverless(false);
    setTwoFacesCover(false);
    setCoverFile(null);
    setCoverPreview(null);
    // Keep paperTypeId as it's likely the same for related publications
  };

  const handleSubmit = async (keepOpen: boolean = false) => {
    if (!localPublicationData) return;

    try {
      setIsUploading(true);

      // Upload cover if provided
      let coverUrl: string | null = null;
      if (coverFile && !coverless) {
        coverUrl = await uploadCover(coverFile);
      }

      // Get all existing related publications in the group
      const existingRelated = (localPublicationData.related_publications as string[]) || [];
      // New publication should be linked to original + all its existing related publications
      const allGroupIds = [localPublicationData.id, ...existingRelated];

      // Create new publication with edited data (excluding id)
      const { id: _id, created_at: _createdAt, ...dataWithoutId } = localPublicationData;
      const newPublicationData = {
        ...dataWithoutId,
        pages,
        paper_type_id: paperTypeId,
        additional_data: additionalData,
        do_round: doRound,
        coverless,
        two_faces_cover: coverless ? false : twoFacesCover,
        cover_url: coverUrl,
        created_at: new Date().toISOString(),
        related_publications: allGroupIds, // Link to ALL group members
      };

      create(
        'publications',
        { data: newPublicationData },
        {
          onSuccess: async (newPublication) => {
            // Use syncAddRelated to update ALL existing group members with the new publication
            // This ensures full group connectivity: if A↔B↔C existed, now A↔B↔C↔D
            const syncResult = await syncAddRelated(newPublication.id, allGroupIds);

            if (!syncResult.success) {
              notify(translate('resources.publications.messages.update_original_error'), {
                type: 'error',
              });
              setIsUploading(false);
              return;
            }

            notify(translate('resources.publications.messages.create_related_success'), {
              type: 'success',
            });
            setIsUploading(false);

            if (keepOpen) {
              // Update local state for chain creation
              setCreatedCount((prev) => prev + 1);
              setLocalPublicationData((prev) =>
                prev
                  ? {
                      ...prev,
                      related_publications: [
                        ...((prev.related_publications as string[]) || []),
                        newPublication.id,
                      ],
                    }
                  : null
              );
              resetFormForNext();
            } else {
              onClose();
            }
          },
          onError: () => {
            notify(translate('resources.publications.messages.create_related_error'), {
              type: 'error',
            });
            setIsUploading(false);
          },
        }
      );
    } catch {
      notify(translate('resources.publications.messages.unexpected_error'), { type: 'error' });
      setIsUploading(false);
    }
  };

  const handleViewPublication = () => {
    redirect('show', 'publications', publicationData.id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalWrapper>
        <ModalContent
          sx={{
            maxWidth: 600,
            maxHeight: '80vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
            p: 3,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontFamily: 'inherit' }}>
            {translate('resources.publications.name', { smart_count: 1 })} -{' '}
            {translate('resources.publications.messages.publication_data')}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'inherit',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                color: 'primary.main',
                textAlign: 'center',
                py: 1,
              }}
            >
              {`${subject?.name || publicationData.subject_id} ${publisher?.name || publicationData.publisher_id} - ${translate(`custom.labels.academic_years.${publicationData.academic_year}.short_name`)} - ${publicationData.term ? translate(`custom.labels.terms.${publicationData.term}.name`) : ''} ${toArabicNumerals(publicationData.year)}`}
            </Typography>

            <Box>
              <Typography sx={{ fontWeight: 'bold', fontFamily: 'inherit', mb: 0.5 }}>
                {translate('resources.publications.fields.pages')}:
              </Typography>
              <TextField
                fullWidth
                type="number"
                size="small"
                value={pages}
                onChange={(e) => setPages(Number(e.target.value))}
                sx={{ fontFamily: 'inherit' }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 'bold', fontFamily: 'inherit', mb: 0.5 }}>
                {translate('resources.publications.fields.paper_type')}:
              </Typography>
              <Select
                fullWidth
                size="small"
                value={paperTypeId}
                onChange={(e) => setPaperTypeId(e.target.value)}
                sx={{ fontFamily: 'inherit' }}
              >
                {paperTypes?.map((paperType) => (
                  <MenuItem key={paperType.id} value={paperType.id}>
                    {paperType.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={doRound}
                    onChange={(e) => setDoRound(e.target.checked)}
                    color="primary"
                  />
                }
                label={translate('resources.publications.fields.do_round')}
                sx={{ fontFamily: 'inherit' }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={coverless}
                    onChange={(e) => setCoverless(e.target.checked)}
                    color="primary"
                  />
                }
                label={translate('resources.publications.fields.coverless')}
                sx={{ fontFamily: 'inherit' }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={twoFacesCover}
                    onChange={(e) => setTwoFacesCover(e.target.checked)}
                    color="primary"
                    disabled={coverless}
                  />
                }
                label={translate('resources.publications.fields.two_faces_cover')}
                sx={{ fontFamily: 'inherit', opacity: coverless ? 0.5 : 1 }}
              />
            </Box>

            {/* Cover Upload */}
            {!coverless && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
                {coverPreview ? (
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
                  >
                    <Box
                      component="img"
                      src={coverPreview}
                      alt="Cover preview"
                      sx={{
                        width: '210px',
                        height: '297px',
                        objectFit: 'cover',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'block',
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {translate('ra.action.edit')}
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview(null);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    sx={(theme) => ({
                      width: '210px',
                      height: '297px',
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: theme.palette.background.paper,
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    })}
                  >
                    <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ m: 0.5 }}>
                      {translate('ra.input.image.upload_single')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {translate('resources.publications.messages.or_paste_image')}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            <Box>
              <Typography sx={{ fontWeight: 'bold', fontFamily: 'inherit', mb: 0.5 }}>
                {translate('resources.publications.fields.additional_data')}:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                value={additionalData}
                onChange={(e) => setAdditionalData(e.target.value)}
                sx={{ fontFamily: 'inherit' }}
              />
            </Box>

            {publicationData.related_publications && (
              <DataRow
                label={translate('resources.publications.fields.related_publications')}
                value={JSON.stringify(publicationData.related_publications)}
              />
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {createdCount > 0 && (
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'inherit',
                color: 'success.main',
                textAlign: 'center',
                mb: 2,
              }}
            >
              {translate('resources.publications.messages.created_related_count', {
                count: createdCount,
              })}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Close />}
              onClick={onClose}
              sx={{ fontFamily: 'inherit' }}
            >
              {translate('ra.action.close')}
            </Button>
            <Button
              variant="outlined"
              color="info"
              startIcon={<Visibility />}
              onClick={handleViewPublication}
              sx={{ fontFamily: 'inherit' }}
            >
              {translate('resources.publications.messages.view_publication')}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={isCreating || isUploading ? <CircularProgress size={16} /> : <Add />}
              onClick={() => handleSubmit(true)}
              disabled={isCreating || isUploading || !additionalData}
              sx={{ fontFamily: 'inherit' }}
            >
              {translate('resources.publications.messages.save_and_add_another')}
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={
                isCreating || isUploading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Save />
                )
              }
              onClick={() => handleSubmit(false)}
              disabled={isCreating || isUploading || !additionalData}
              sx={{ fontFamily: 'inherit' }}
            >
              {translate('resources.publications.messages.save_related_publication')}
            </Button>
          </Box>
        </ModalContent>
      </ModalWrapper>
    </Modal>
  );
};

const DataRow = ({ label, value }: { label: string; value: string | number }) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <Typography sx={{ fontWeight: 'bold', fontFamily: 'inherit' }}>{label}:</Typography>
    <Typography sx={{ fontFamily: 'inherit' }}>{value}</Typography>
  </Box>
);
