import {
  Create,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  BooleanInput,
  ImageInput,
  useDataProvider,
  useStore,
  useTranslate,
  ImageField,
  number,
} from 'react-admin';
import { AccordionSummary, Accordion, AccordionDetails, Box, Typography, Fab } from '@mui/material';
import { KeyboardDoubleArrowDown, ControlPoint } from '@mui/icons-material';

import { StyledForm } from 'components/form';
import { supabase } from 'lib';
import { STOREGE_URL, Tables, TablesInsert } from 'types';
import { toArabicNumerals } from 'utils';

import {
  Publication,
  PublicationWithFileCover,
  useTermsChoises,
  usePublicationTypesChoices,
  useAcademicYearsChoises,
} from '..';

export const PublicationCreate = () => {
  const dataProvider = useDataProvider();
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

  const publicationTypesChoises = usePublicationTypesChoices();
  const termsOptions = useTermsChoises();

  const academicYearsChoises = useAcademicYearsChoises();

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
        <AutocompleteInput
          source="publication_type"
          choices={publicationTypesChoises}
          fullWidth
          helperText={false}
        />

        <ReferenceInput source="subject_id" reference="subjects">
          <AutocompleteInput
            fullWidth
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
            onCreate={async (value) => {
              const { data } = await dataProvider.create('subjects', { data: { name: value } });
              return data;
            }}
            helperText={false}
          />
        </ReferenceInput>

        <ReferenceInput source="publisher" reference="publishers">
          <AutocompleteInput
            sx={{ width: '100%', fontSize: '1rem' }}
            helperText={false}
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
            onCreate={async (name) => {
              const { data } = await dataProvider.create('publishers', { data: { name } });
              return data;
            }}
          />
        </ReferenceInput>

        <AutocompleteInput
          source="academic_year"
          fullWidth
          helperText={false}
          choices={academicYearsChoises}
        />

        <TextInput fullWidth source="pages" helperText={false} validate={[number()]} />

        <ImageInput
          source="cover_url"
          accept={{ 'image/*': ['.png', '.jpg'] }}
          helperText={false}
          sx={(theme) => ({
            '& .RaFileInput-dropZone': {
              backgroundColor: theme.palette.background.paper,
              '& p': {
                m: 0.5,
              },
            },
          })}
        >
          <ImageField source="src" title="title" />
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
          <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextInput fullWidth source="year" helperText={false} />

            <ReferenceInput source="default_paper_size" reference="paper_types">
              <AutocompleteInput
                fullWidth
                helperText={false}
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
              defaultValue={setting?.current_term}
              helperText={false}
            />

            <TextInput fullWidth source="additional_data" helperText={false} />

            <TextInput fullWidth source="related_publications" helperText={false} />

            <BooleanInput source="do_round" defaultValue={true} helperText={false} />

            <BooleanInput source="two_faces_cover" defaultValue={false} helperText={false} />

            <Box sx={{ width: '100%', gap: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography>
                {toArabicNumerals('تعديل السعر بقيمة (5, - 10 , إلخ ...) بالجنيه')}
              </Typography>

              <Box sx={{ width: '100%', gap: 1, display: 'flex' }}>
                <TextInput
                  source="change_price.oneFacePrice"
                  helperText={false}
                  validate={[number()]}
                />
                <TextInput
                  source="change_price.twoFacesPrice"
                  helperText={false}
                  validate={[number()]}
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </StyledForm>
    </Create>
  );
};
