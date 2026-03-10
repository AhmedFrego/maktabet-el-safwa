import { Edit, useEditController, useTranslate, useRedirect } from 'react-admin';
import { Fab } from '@mui/material';
import { Save } from '@mui/icons-material';

import { StyledForm } from 'components/form';
import { supabase } from 'lib';
import { TablesUpdate, STOREGE_URL, Tables } from 'types';
import { extractFileName, resizeToA4 } from 'utils';

import { Publication, PublicationForm, PublicationWithFileCover } from '.';

export const PublicationEdit = () => {
  const translate = useTranslate();
  const controller = useEditController<Publication>();
  const record = controller.record;
  const redirect = useRedirect();

  const transform = async (data: PublicationWithFileCover | TablesUpdate<'publications'>) => {
    const { data: session } = await supabase.auth.getSession();

    if (!session.session) return Promise.reject('no logged in user');
    const file = typeof data.cover_url === 'string' ? null : data.cover_url?.rawFile;

    if (file) {
      let uploadBlob: Blob = file;
      try {
        // Resize and compress the image before upload
        uploadBlob = await resizeToA4(file);
      } catch (resizeError) {
        console.error('Image resize error:', resizeError);
        throw resizeError;
      }

      const oldPath = extractFileName(record?.cover_url || '');
      console.log('[Edit] Old cover_url:', record?.cover_url, '| path:', oldPath);

      // Upload new cover with a fresh name
      const newName = `/${new Date().getTime()}${file.name.replace(/\s+/g, '-')}`;
      const { data: cover, error } = await supabase.storage
        .from('covers')
        .upload(newName, uploadBlob);

      if (error) {
        throw error;
      } else {
        const fullPath = `${STOREGE_URL}${cover?.fullPath}`;
        console.log('[Edit] New cover_url:', fullPath);
        data.cover_url = fullPath;
      }

      // Remove old cover from storage
      if (oldPath) {
        const { error: removeError } = await supabase.storage.from('covers').remove([oldPath]);
        if (removeError) console.error('Error removing old cover:', removeError);
      }
    } else data.cover_url = data.cover_url || null;

    data.updated_by = session.session?.user.id;
    data.updated_at = new Date().toISOString();

    return data as unknown as Publication;
  };
  return (
    <Edit transform={transform} actions={false}>
      <StyledForm
        toolbar={
          <Fab
            variant="extended"
            color="info"
            sx={{ bottom: 10, fontFamily: 'inherit', position: 'fixed' }}
            type="submit"
          >
            <Save sx={{ mr: 1 }} />
            {translate('ra.action.save')}
          </Fab>
        }
      >
        <PublicationForm
          onRelatedPublicationSuccess={(data) => {
            const publication = data as Tables<'publications'>;
            redirect(`/publications/${publication.id}/create-related`);
          }}
        />
      </StyledForm>
    </Edit>
  );
};
