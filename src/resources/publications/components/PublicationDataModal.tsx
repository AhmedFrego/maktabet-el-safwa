import { useState } from 'react';
import {
  Box,
  Button,
  Modal,
  Typography,
  Divider,
  TextField,
  Select,
  MenuItem,
} from '@mui/material';
import { Close, Visibility, Save } from '@mui/icons-material';
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
import { Tables } from 'types';
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
  const [update, { isPending: isUpdating }] = useUpdate();
  const [pages, setPages] = useState(publicationData?.pages || 0);
  const [paperTypeId, setPaperTypeId] = useState(publicationData?.paper_type_id || '');
  const [additionalData, setAdditionalData] = useState(publicationData?.additional_data || '');

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

  const handleSubmit = async () => {
    try {
      // Create new publication with edited data (excluding id)
      const { ...dataWithoutId } = publicationData;
      const newPublicationData = {
        ...dataWithoutId,
        pages,
        paper_type_id: paperTypeId,
        additional_data: additionalData,
        created_at: new Date().toISOString(),
        related_publications: [publicationData.id],
      };

      create(
        'publications',
        { data: newPublicationData },
        {
          onSuccess: (newPublication) => {
            // Update original publication with new publication ID in related_publications
            const currentRelatedPublications = publicationData.related_publications || [];
            const updatedRelatedPublications = [...currentRelatedPublications, newPublication.id];

            update(
              'publications',
              {
                id: publicationData.id,
                data: { related_publications: updatedRelatedPublications },
                previousData: publicationData,
              },
              {
                onSuccess: () => {
                  notify(translate('resources.publications.messages.create_related_success'), {
                    type: 'success',
                  });
                  onClose();
                },
                onError: () => {
                  notify(translate('resources.publications.messages.update_original_error'), {
                    type: 'error',
                  });
                },
              }
            );
          },
          onError: () => {
            notify(translate('resources.publications.messages.create_related_error'), {
              type: 'error',
            });
          },
        }
      );
    } catch {
      notify(translate('resources.publications.messages.unexpected_error'), { type: 'error' });
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

            <DataRow
              label={translate('resources.publications.fields.do_round')}
              value={
                publicationData.do_round
                  ? translate('resources.publications.messages.yes')
                  : translate('resources.publications.messages.no')
              }
            />

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

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
              variant="contained"
              color="success"
              startIcon={<Save />}
              onClick={handleSubmit}
              disabled={isCreating || isUpdating}
              sx={{ fontFamily: 'inherit' }}
            >
              {isCreating || isUpdating
                ? translate('resources.publications.messages.saving')
                : translate('resources.publications.messages.save_related_publication')}
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
