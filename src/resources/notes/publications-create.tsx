import {
  Create,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  NumberInput,
  BooleanInput,
  ImageInput,
  FileField,
  useDataProvider,
  useStore,
  useTranslate,
  useCreate,
} from 'react-admin';
import { AccordionSummary, Accordion, AccordionDetails } from '@mui/material';
import { KeyboardDoubleArrowDown } from '@mui/icons-material';

import { StyledForm } from 'components/form';

import { supabase } from 'lib';
import { Enums, STOREGE_URL, Tables } from 'types';

import { Publication } from '.';

export const PublicationCreate = () => {
  const dataProvider = useDataProvider();
  const [settings] = useStore<Tables<'settings'>>('settings');
  const translate = useTranslate();

  type PublicationWithFileCover = Omit<Publication, 'cover_url'> & {
    cover_url?: { rawFile: File };
  };

  const transform = async (data: PublicationWithFileCover | Publication): Promise<Publication> => {
    const { data: session } = await supabase.auth.getSession();

    if (!session.session) return Promise.reject('no logged in user');
    const file = typeof data.cover_url === 'string' ? null : data.cover_url?.rawFile;
    if (file) {
      const { data: cover, error } = await supabase.storage
        .from('covers')
        .upload(`/${new Date().getTime()}${file.name.replace(/\s+/g, '-')}`, file);
      if (error) {
        throw error;
      } else {
        const fullPath = `${STOREGE_URL}${cover?.fullPath}`;
        data.cover_url = fullPath;
      }
    } else data.cover_url = null;
    data.created_by = session.session?.user.id;

    return data as unknown as Publication;
  };

  const publicationTypesChoises = [
    { id: 'book', name: translate('resources.publications.labels.book') },
    { id: 'note', name: translate('resources.publications.labels.note') },
    { id: 'other', name: translate('resources.publications.labels.other') },
  ] as {
    id: Enums<'publications_types'>;
    name: string;
  }[];

  const termsOptions = [
    { id: '1st', name: '1st' },
    { id: '2nd', name: '2nd' },
    { id: 'full_year', name: 'full_year' },
  ] as {
    id: Enums<'term'>;
    name: string;
  }[];

  return (
    <Create transform={transform}>
      <StyledForm
        defaultValues={{
          year: settings?.current_year,
          term: settings?.current_term,
          default_paper_size: settings?.default_paper_size,
        }}
      >
        <AutocompleteInput source="publication_type" choices={publicationTypesChoises} fullWidth />
        <ReferenceInput source="subject_id" reference="subjects">
          <AutocompleteInput
            fullWidth
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
            onCreate={async (value) => {
              const { data } = await dataProvider.create('subjects', { data: { name: value } });
              return data;
            }}
          />
        </ReferenceInput>
        <ReferenceInput source="publisher" reference="publishers">
          <AutocompleteInput
            sx={{ width: '100%', fontSize: '1rem' }}
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
            onCreate={async (value) => {
              const { data } = await dataProvider.create('publishers', { data: { name: value } });
              return data;
            }}
          />
        </ReferenceInput>
        <ReferenceInput
          source="academic_year"
          reference="academic_years"
          sort={{ field: 'stage', order: 'DESC' }}
        >
          <AutocompleteInput
            fullWidth
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
          />
        </ReferenceInput>
        <NumberInput fullWidth source="pages" />
        <ImageInput source="cover_url" accept={{ 'image/*': ['.png', '.jpg'] }}>
          <FileField source="src" title="title" />
        </ImageInput>
        <Accordion sx={{ '&.Mui-expanded': { m: 0 } }}>
          <AccordionSummary
            expandIcon={<KeyboardDoubleArrowDown />}
            sx={(theme) => ({
              width: '100%',
              fontFamily: 'inherit',
              backgroundColor: theme.palette.action.hover,
              '& .MuiAccordionSummary-content': {
                m: 0,
              },
              '&.MuiAccordionSummary-root.Mui-expanded': {
                mb: 2,
                minHeight: 45,
              },
            })}
          >
            المزيد من التفاصيل
          </AccordionSummary>
          <AccordionDetails>
            <TextInput fullWidth source="year" />
            <ReferenceInput source="default_paper_size" reference="paper_types">
              <AutocompleteInput
                fullWidth
                filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
                onCreate={async (value) => {
                  const { data } = await dataProvider.create('paper_types', {
                    data: { name: value },
                  });
                  return data;
                }}
              />
            </ReferenceInput>
            <AutocompleteInput
              fullWidth
              source="term"
              filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
              choices={termsOptions}
              defaultValue={settings?.current_term}
            />
            <TextInput fullWidth source="additional_data" />
            <TextInput fullWidth source="related_publications" />
            <BooleanInput source="do_round" defaultValue={true} />
            <BooleanInput source="two_faces_cover" defaultValue={false} />
            <NumberInput fullWidth source="price" />
          </AccordionDetails>
        </Accordion>
      </StyledForm>
    </Create>
  );
};
