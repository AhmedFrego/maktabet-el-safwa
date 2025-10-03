import {
  AutocompleteInput,
  BooleanInput,
  DateInput,
  Edit,
  NumberInput,
  ReferenceInput,
  TextInput,
  useEditController,
  useTranslate,
} from 'react-admin';
import { StyledForm } from 'components/form';

import { ImageInput, FileField } from 'react-admin';
import { AccordionSummary, Accordion, AccordionDetails } from '@mui/material';
import { KeyboardDoubleArrowDown } from '@mui/icons-material';
import { Enums, TablesUpdate } from 'types/supabase-generated.types';
import { supabase } from 'lib/supabase';
import { Publication, PublicationWithFileCover } from './types';
import { STOREGE_URL } from 'types/constants';
import { extractFileName } from 'utils/helpers';

export const PublicationEdit = () => {
  const translate = useTranslate();
  const controller = useEditController<Publication>(); // ✅ fetch current record
  const record = controller.record; // ✅ safe to use

  const termsOptions = [
    { id: '1st', name: translate('resources.publications.labels.term.1st') },
    { id: '2nd', name: translate('resources.publications.labels.term.2nd') },
    { id: 'full_year', name: translate('resources.publications.labels.term.full_year') },
  ] as {
    id: Enums<'term'>;
    name: string;
  }[];

  const transform = async (data: PublicationWithFileCover | TablesUpdate<'publications'>) => {
    const { data: session } = await supabase.auth.getSession();

    if (!session.session) return Promise.reject('no logged in user');
    const file = typeof data.cover_url === 'string' ? null : data.cover_url?.rawFile;
    if (file) {
      const { data: cover, error } = await supabase.storage
        .from('covers')
        .update(extractFileName(record?.cover_url), file);

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
    <Edit transform={transform}>
      <StyledForm>
        <ReferenceInput source="subject_id" reference="subjects">
          <AutocompleteInput
            fullWidth
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
          />
        </ReferenceInput>

        <ReferenceInput source="publisher" reference="publishers">
          <AutocompleteInput
            sx={{ width: '100%', fontSize: '1rem' }}
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
          />
        </ReferenceInput>

        <ReferenceInput source="academic_year" reference="academic_years">
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
              />
            </ReferenceInput>

            <AutocompleteInput
              fullWidth
              filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
              source="term"
              choices={termsOptions}
            />

            <TextInput fullWidth source="additional_data" />

            <TextInput fullWidth source="related_notes" />

            <BooleanInput source="do_round" />

            <NumberInput fullWidth source="price" />

            <DateInput source="created_at" fullWidth disabled />

            <TextInput source="created_by" fullWidth disabled />

            <DateInput source="updated_at" fullWidth disabled />

            <TextInput source="updated_by" fullWidth disabled />
          </AccordionDetails>
        </Accordion>
      </StyledForm>
    </Edit>
  );
};
