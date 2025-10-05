import { Edit, useEditController, useTranslate } from 'react-admin';
import { Fab } from '@mui/material';
import { Save } from '@mui/icons-material';

import { StyledForm } from 'components/form';
import { supabase } from 'lib';
import { TablesUpdate, STOREGE_URL } from 'types';
import { extractFileName } from 'utils';

import { PublicationForm } from '.';
import { Publication, PublicationWithFileCover } from '..';

export const PublicationEdit = () => {
  const translate = useTranslate();
  const controller = useEditController<Publication>();
  const record = controller.record;

  const transform = async (data: PublicationWithFileCover | TablesUpdate<'publications'>) => {
    const { data: session } = await supabase.auth.getSession();

    if (!session.session) return Promise.reject('no logged in user');
    const file = typeof data.cover_url === 'string' ? null : data.cover_url?.rawFile;
    if (file) {
      const { data: cover, error } = await supabase.storage
        .from('covers')
        .update(extractFileName(record?.cover_url || '') || '', file);

      if (error) {
        throw error;
      } else {
        const fullPath = `${STOREGE_URL}${cover?.fullPath}`;
        data.cover_url = fullPath;
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
        <PublicationForm />
      </StyledForm>
    </Edit>
  );
};
