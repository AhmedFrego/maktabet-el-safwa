import { Create, useStore, useTranslate } from 'react-admin';
import { Fab } from '@mui/material';
import { ControlPoint } from '@mui/icons-material';

import { StyledForm } from 'components/form';
import { supabase } from 'lib';
import { STOREGE_URL, Tables, TablesInsert } from 'types';

import { Publication, PublicationWithFileCover, PublicationForm } from '..';

export const PublicationCreate = () => {
  const [setting] = useStore<Tables<'settings'>>('settings');
  const translate = useTranslate();

  const transform = async (
    data: PublicationWithFileCover | TablesInsert<'publications'>
  ): Promise<TablesInsert<'publications'>> => {
    const { data: session } = await supabase.auth.getSession();

    if (!session.session) return Promise.reject('no logged in user');
    const file = typeof data.cover_url === 'string' ? null : data.cover_url?.rawFile;
    if (file) {
      const { data: cover, error } = await supabase.storage
        .from('covers')
        .upload(`/${new Date().getTime()}${file.name.replace(/\s+/g, '-')}`, file);
      if (error) throw error;
      else {
        const fullPath = `${STOREGE_URL}${cover?.fullPath}`;
        data.cover_url = fullPath;
      }
    } else data.cover_url = null;

    data.created_by = session.session?.user.id;
    data.created_at = new Date().toISOString();

    return data as unknown as Publication;
  };

  return (
    <Create transform={transform} sx={{ position: 'relative' }}>
      <StyledForm
        defaultValues={{
          year: setting?.current_year,
          term: setting?.current_term,
          default_paper_size: setting?.default_paper_size,
        }}
        toolbar={
          <Fab
            variant="extended"
            color="info"
            sx={{ bottom: 10, fontFamily: 'inherit', position: 'fixed' }}
            type="submit"
          >
            <ControlPoint sx={{ mr: 1 }} />
            {translate('ra.action.create')}
          </Fab>
        }
      >
        <PublicationForm />
      </StyledForm>
    </Create>
  );
};
