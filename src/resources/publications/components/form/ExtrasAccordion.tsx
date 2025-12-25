import { PropsWithChildren } from 'react';
import { KeyboardDoubleArrowDown, Link as LinkIcon } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
  Button,
} from '@mui/material';
import {
  AutocompleteInput,
  BooleanInput,
  number,
  ReferenceInput,
  required,
  TextInput,
  useSaveContext,
  useTranslate,
} from 'react-admin';

import { toArabicNumerals } from 'utils';

import { TermInput, YearInput } from '.';

interface ExtrasAccordionProps extends PropsWithChildren {
  onRelatedPublicationSuccess?: (data: unknown) => void;
}

export const ExtrasAccordion = ({
  children,
  onRelatedPublicationSuccess,
}: ExtrasAccordionProps) => {
  const { save } = useSaveContext();
  const translate = useTranslate();

  const handleRelatedPublicationClick = async () => {
    if (save) {
      await save(
        {},
        {
          onSuccess: (data) => {
            if (onRelatedPublicationSuccess) {
              onRelatedPublicationSuccess(data);
            }
          },
        }
      );
    }
  };

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

        <Button
          type="button"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          startIcon={<LinkIcon />}
          onClick={handleRelatedPublicationClick}
          sx={{ fontFamily: 'inherit', py: 1.5 }}
        >
          {translate('resources.publications.messages.save_and_manage_related')}
        </Button>

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
