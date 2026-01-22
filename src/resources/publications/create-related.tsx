import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Divider, Paper, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import {
  useTranslate,
  useRedirect,
  useGetOne,
  useCreate,
  useNotify,
  Title,
  Form,
} from 'react-admin';

import { syncAddRelated } from 'utils/helpers/syncRelatedPublications';
import { resizeToA4 } from 'utils/helpers/resizeToA4';
import { supabase } from 'lib/supabase';
import { STOREGE_URL, Tables } from 'types';
import { Loading } from 'components/UI';

import {
  ParentPublicationInfo,
  RelatedPublicationFields,
  RelatedPublicationFormActions,
} from './components';

export const CreateRelatedPublication = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const translate = useTranslate();
  const redirect = useRedirect();
  const notify = useNotify();
  const [create, { isPending: isCreating }] = useCreate();
  const [createdCount, setCreatedCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [localRelatedIds, setLocalRelatedIds] = useState<string[]>([]);

  // Fetch parent publication
  const { data: publicationData, isLoading } = useGetOne<Tables<'publications'>>(
    'publications',
    { id: id || '' },
    { enabled: !!id }
  );

  // Fetch related data for display
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

  // Upload cover to Supabase storage
  const uploadCover = useCallback(
    async (coverData: { rawFile?: File } | string | null): Promise<string | null> => {
      if (!coverData || typeof coverData === 'string') return null;
      const file = coverData.rawFile;
      if (!file) return null;

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
    },
    []
  );

  const handleSubmit = useCallback(
    async (formData: Record<string, unknown>, keepOpen: boolean = false) => {
      if (!publicationData) return;

      try {
        setIsUploading(true);

        // Upload cover if provided
        let coverUrl: string | null = null;
        if (!formData.coverless && formData.cover_url) {
          coverUrl = await uploadCover(formData.cover_url as { rawFile?: File } | string | null);
        }

        // Get all existing related publications in the group
        const existingRelated = [
          ...((publicationData.related_publications as string[]) || []),
          ...localRelatedIds,
        ];
        // New publication should be linked to original + all its existing related publications
        const allGroupIds = [...new Set([publicationData.id, ...existingRelated])];

        // Create new publication with form data + inherited shared fields
        const newPublicationData = {
          // Shared fields from parent (cannot be changed)
          publication_type: publicationData.publication_type,
          subject_id: publicationData.subject_id,
          publisher_id: publicationData.publisher_id,
          academic_year: publicationData.academic_year,
          term: publicationData.term,
          year: publicationData.year,
          created_by: publicationData.created_by,
          // Editable fields from form
          pages: formData.pages,
          paper_type_id: formData.paper_type_id,
          additional_data: formData.additional_data,
          do_round: formData.do_round || false,
          coverless: formData.coverless || false,
          two_faces_cover: formData.coverless ? false : formData.two_faces_cover || false,
          cover_url: coverUrl,
          created_at: new Date().toISOString(),
          related_publications: allGroupIds,
        };

        create(
          'publications',
          { data: newPublicationData },
          {
            onSuccess: async (newPublication) => {
              // Use syncAddRelated to update ALL existing group members with the new publication
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
                setLocalRelatedIds((prev) => [...prev, newPublication.id]);
              } else {
                // Navigate back to the parent publication
                redirect('show', 'publications', publicationData.id);
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
    },
    [publicationData, localRelatedIds, uploadCover, create, notify, translate, redirect]
  );

  const handleViewPublication = () => {
    if (publicationData) {
      redirect('show', 'publications', publicationData.id);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!publicationData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          {translate('resources.publications.messages.not_found')}
        </Typography>
      </Box>
    );
  }

  // Default values from parent publication
  const defaultValues = {
    pages: 0,
    paper_type_id: publicationData.paper_type_id || '',
    additional_data: '',
    do_round: true,
    coverless: false,
    two_faces_cover: false,
  };

  return (
    <Box sx={{ p: 2 }}>
      <Title title={translate('resources.publications.messages.create_related_title')} />

      <Paper
        sx={{
          maxWidth: 800,
          mx: 'auto',
          p: 3,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" sx={{ fontFamily: 'inherit' }}>
            {translate('resources.publications.messages.create_related_title')}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Parent publication info (read-only) */}
        <ParentPublicationInfo
          publication={publicationData}
          subjectName={subject?.name}
          publisherName={publisher?.name}
        />

        <Form defaultValues={defaultValues} key={createdCount}>
          <RelatedPublicationFields />

          <Divider sx={{ my: 3 }} />

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

          <RelatedPublicationFormActions
            isLoading={isCreating || isUploading}
            onBack={handleBack}
            onViewPublication={handleViewPublication}
            onSaveAndAddAnother={(data) => handleSubmit(data, true)}
            onSave={(data) => handleSubmit(data, false)}
          />
        </Form>
      </Paper>
    </Box>
  );
};
