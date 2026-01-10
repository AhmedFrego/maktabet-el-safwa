import { PropsWithChildren, useEffect } from 'react';
import { KeyboardDoubleArrowDown } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import {
  AutocompleteInput,
  BooleanInput,
  number,
  ReferenceInput,
  required,
  TextInput,
  FormDataConsumer,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';

import { toArabicNumerals } from 'utils';

import { TermInput, YearInput, RelatedPublicationButton } from '.';

interface ExtrasAccordionProps extends PropsWithChildren {
  onRelatedPublicationSuccess?: (data: unknown) => void;
}

export const ExtrasAccordion = ({
  children,
  onRelatedPublicationSuccess,
}: ExtrasAccordionProps) => {
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
        <ReferenceInput source="paper_type_id" reference="paper_types">
          <AutocompleteInput
            fullWidth
            helperText={false}
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
            validate={[required()]}
          />
        </ReferenceInput>

        <TermInput />
        <YearInput source="year" />

        <TextInput fullWidth source="additional_data" helperText={false} />

        <RelatedPublicationButton onSuccess={onRelatedPublicationSuccess} />

        <BooleanInput source="do_round" defaultValue={true} helperText={false} />

        <BooleanInput source="coverless" defaultValue={false} helperText={false} />

        <FormDataConsumer>
          {({ formData }) => {
            // Component to handle side effect of resetting two_faces_cover
            const TwoFacesCoverController = () => {
              const { setValue, watch } = useFormContext();
              const coverless = watch('coverless');

              useEffect(() => {
                if (coverless) {
                  setValue('two_faces_cover', false);
                }
              }, [coverless, setValue]);

              return (
                <BooleanInput
                  source="two_faces_cover"
                  defaultValue={false}
                  helperText={false}
                  disabled={formData.coverless}
                />
              );
            };

            return <TwoFacesCoverController />;
          }}
        </FormDataConsumer>

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
