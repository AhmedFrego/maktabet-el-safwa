import {
  Create,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  NumberInput,
  BooleanInput,
  useGetList,
  ImageInput,
  FileField,
} from 'react-admin';
import { AccordionSummary, Accordion, AccordionDetails } from '@mui/material';
import { KeyboardDoubleArrowDown } from '@mui/icons-material';

import { StyledForm } from 'components/form';

import { supabase } from 'lib';
import { STOREGE_URL, Tables } from 'types';

import { Note } from '.';

export const NoteCreate = () => {
  const { data: settings } = useGetList<Tables<'settings'>>('settings', {
    meta: { columns: ['*'] },
  });

  type NoteWithFileCover = Omit<Note, 'cover_url'> & {
    cover_url?: {
      rawFile: File;
    };
  };

  const transform = async (data: NoteWithFileCover | Note): Promise<Note> => {
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

    return data as unknown as Note;
  };

  return (
    <Create transform={transform}>
      <StyledForm
        defaultValues={{
          year: settings?.[0]?.current_year,
          term_id: settings?.[0]?.current_term,
          default_paper_size: settings?.[0].default_paper_size,
        }}
      >
        <ReferenceInput source="subject_id" reference="subjects">
          <AutocompleteInput
            sx={{ width: '100%' }}
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
          />
          <TextInput sx={{ width: '100%' }} source="nickname" />
        </ReferenceInput>
        <ReferenceInput source="teacher_id" reference="teachers">
          <AutocompleteInput
            sx={{ width: '100%', fontSize: '1rem' }}
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
          />
        </ReferenceInput>
        <ReferenceInput source="academic_year" reference="academic_years">
          <AutocompleteInput
            sx={{ width: '100%' }}
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
          />
        </ReferenceInput>

        <NumberInput sx={{ width: '100%' }} source="pages" />
        <ImageInput source="cover_url" accept={{ 'image/*': ['.png', '.jpg'] }}>
          <FileField source="src" title="title" />
        </ImageInput>

        <Accordion>
          <AccordionSummary expandIcon={<KeyboardDoubleArrowDown />} sx={{ width: '100%' }}>
            المزيد من التفاصيل
          </AccordionSummary>
          <AccordionDetails>
            <TextInput sx={{ width: '100%' }} source="year" />
            <ReferenceInput source="default_paper_size" reference="paper_sizes">
              <AutocompleteInput
                sx={{ width: '100%' }}
                filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
              />
            </ReferenceInput>
            <ReferenceInput source="term_id" reference="terms">
              <AutocompleteInput
                sx={{ width: '100%' }}
                filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
              />
            </ReferenceInput>
            <TextInput sx={{ width: '100%' }} source="additional_data" />
            <TextInput sx={{ width: '100%' }} source="related_notes" />
            <BooleanInput source="do_round" defaultValue={true} />
            <NumberInput sx={{ width: '100%' }} source="price" />
          </AccordionDetails>
        </Accordion>
      </StyledForm>
    </Create>
  );
};
