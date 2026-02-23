import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { ArrowBack, Save, Visibility, Add } from '@mui/icons-material';
import { Create, useTranslate, useRedirect, useGetOne, useNotify, useStore } from 'react-admin';

import { StyledForm } from 'components/form';
import { syncAddRelated } from 'utils/helpers/syncRelatedPublications';
import { resizeToA4 } from 'utils/helpers/resizeToA4';
import { supabase } from 'lib/supabase';
import { STOREGE_URL, Tables, TablesInsert } from 'types';
import { Loading } from 'components/UI';

import { PublicationForm } from './components';
import { PublicationWithFileCover } from './types';

export const CreateRelatedPublication = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const translate = useTranslate();
  const redirect = useRedirect();
  const notify = useNotify();
  const [setting] = useStore<Tables<'settings'>>('settings');
  const [createdCount, setCreatedCount] = useState(0);
  const [saveAndAddAnother, setSaveAndAddAnother] = useState(false);

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

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewPublication = () => {
    if (publicationData) {
      redirect('show', 'publications', publicationData.id);
    }
  };

  // Transform function similar to create.tsx but with inherited fields
  const transform = async (
    data: PublicationWithFileCover | TablesInsert<'publications'>
  ): Promise<TablesInsert<'publications'>> => {
    if (!publicationData) return Promise.reject('Parent publication not found');

    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return Promise.reject('no logged in user');

    // Handle cover upload (same logic as create.tsx)
    const file = typeof data.cover_url === 'string' ? null : data.cover_url?.rawFile;
    if (file) {
      const resizedBlob = await resizeToA4(file);
      const { data: cover, error } = await supabase.storage
        .from('covers')
        .upload(`/${new Date().getTime()}${file.name.replace(/\s+/g, '-')}`, resizedBlob);
      if (error) throw error;
      const fullPath = `${STOREGE_URL}${cover?.fullPath}`;
      data.cover_url = fullPath;
    } else {
      data.cover_url = null;
    }

    // Get all existing related publications in the group
    const existingRelated = (publicationData.related_publications as string[]) || [];
    const allGroupIds = [...new Set([publicationData.id, ...existingRelated])];

    // Merge inherited fields from parent with form data
    const transformedData: TablesInsert<'publications'> = {
      // Inherited fields from parent (cannot be changed)
      publication_type: publicationData.publication_type,
      subject_id: publicationData.subject_id,
      publisher_id: publicationData.publisher_id,
      academic_year: publicationData.academic_year,
      term: publicationData.term,
      year: publicationData.year,
      // User provided fields
      pages: data.pages ?? 0,
      paper_type_id: data.paper_type_id ?? '',
      additional_data: data.additional_data ?? '',
      do_round: data.do_round || false,
      coverless: data.coverless || false,
      two_faces_cover: data.coverless ? false : data.two_faces_cover || false,
      cover_url: data.cover_url,
      related_publications: allGroupIds,
      created_by: session.session.user.id,
      created_at: new Date().toISOString(),
      change_price: { oneFacePrice: 0, twoFacesPrice: 0 },
    };

    return transformedData;
  };

  // Handle success after creation
  const handleSuccess = async (createdPublication: Tables<'publications'>) => {
    if (!publicationData) return;

    try {
      // Get all existing related publications in the group
      const existingRelated = (publicationData.related_publications as string[]) || [];
      const allGroupIds = [...new Set([publicationData.id, ...existingRelated])];

      // Sync the new publication with all group members
      const syncResult = await syncAddRelated(
        createdPublication.id,
        allGroupIds,
        publicationData.id
      );

      if (!syncResult.success) {
        notify(translate('resources.publications.messages.update_original_error'), {
          type: 'warning',
        });
      } else {
        notify(translate('resources.publications.messages.create_related_success'), {
          type: 'success',
        });
      }

      if (saveAndAddAnother) {
        // Reset for next creation
        setCreatedCount((prev) => prev + 1);
        setSaveAndAddAnother(false);
      } else {
        // Navigate back to parent publication
        redirect('show', 'publications', publicationData.id);
      }
    } catch (error) {
      console.error('Sync error:', error);
      notify(translate('resources.publications.messages.unexpected_error'), { type: 'error' });
    }
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

  // Default values from parent publication + settings
  const defaultValues = {
    paper_type_id: publicationData.paper_type_id || setting?.default_paper_size || '',
    cover_url: null,
    additional_data: '',
    do_round: true,
    coverless: false,
    two_faces_cover: false,
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, maxWidth: 800, mx: 'auto' }}>
        <IconButton onClick={handleBack}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ fontFamily: 'inherit', flex: 1 }}>
          {translate('resources.publications.messages.create_related_title')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Visibility />}
          onClick={handleViewPublication}
          sx={{ fontFamily: 'inherit' }}
        >
          {translate('resources.publications.messages.view_publication')}
        </Button>
      </Box>

      {/* Success counter */}
      {createdCount > 0 && (
        <Box sx={{ maxWidth: 800, mx: 'auto', mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'inherit',
              color: 'success.main',
              textAlign: 'center',
              p: 1,
              backgroundColor: 'success.light',
              borderRadius: 1,
            }}
          >
            {translate('resources.publications.messages.created_related_count', {
              count: createdCount,
            })}
          </Typography>
        </Box>
      )}

      {/* Use React Admin Create component */}
      <Create
        resource="publications"
        transform={transform}
        mutationOptions={{ onSuccess: handleSuccess }}
        redirect={false}
        actions={false}
        key={createdCount} // Reset form when count changes
      >
        <StyledForm
          defaultValues={defaultValues}
          toolbar={
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                justifyContent: 'center',
                position: 'fixed',
                bottom: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                type="submit"
                sx={{ fontFamily: 'inherit' }}
              >
                {translate('resources.publications.messages.save_related_publication')}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Add />}
                onClick={() => {
                  setSaveAndAddAnother(true);
                  // Trigger form submission
                  const form = document.querySelector('form');
                  if (form) {
                    const event = new Event('submit', { cancelable: true, bubbles: true });
                    form.dispatchEvent(event);
                  }
                }}
                sx={{ fontFamily: 'inherit' }}
              >
                {translate('resources.publications.messages.save_and_add_another')}
              </Button>
            </Box>
          }
        >
          <PublicationForm
            mode="related"
            parentPublication={publicationData}
            parentSubjectName={subject?.name}
            parentPublisherName={publisher?.name}
          />
        </StyledForm>
      </Create>
    </Box>
  );
};
