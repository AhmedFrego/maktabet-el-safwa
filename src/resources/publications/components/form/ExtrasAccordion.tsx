import { PropsWithChildren } from 'react';
import { KeyboardDoubleArrowDown } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import {
  AutocompleteInput,
  BooleanInput,
  number,
  ReferenceInput,
  TextInput,
  useDataProvider,
} from 'react-admin';

import { toArabicNumerals } from 'utils';

import { TermInput, YearInput } from '.';

export const ExtrasAccordion = ({ children }: PropsWithChildren) => {
  const dataProvider = useDataProvider();
  return (
    <Accordion sx={{ '&.Mui-expanded': { m: 0 } }}>
      <AccordionSummary
        expandIcon={<KeyboardDoubleArrowDown />}
        sx={(theme) => ({
          width: '100%',
          fontFamily: 'inherit',
          backgroundColor: theme.palette.action.hover,
          '& .MuiAccordionSummary-content.Mui-expanded': {
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
        <ReferenceInput source="paper_type" reference="paper_types">
          <AutocompleteInput
            fullWidth
            helperText={false}
            onCreate={async (value) => {
              const { data } = await dataProvider.create('paper_types', {
                data: { name: value },
              });
              return data;
            }}
          />
        </ReferenceInput>

        <TermInput />
        <YearInput source="year" />

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
        {children}
      </AccordionDetails>
    </Accordion>
  );
};
