import { Box, Typography } from '@mui/material';
import { FormDataConsumer, useTranslate } from 'react-admin';
import { useCalcPrice } from 'hooks';
import { toArabicNumerals } from 'utils';

export const PriceDisplay = () => {
  const translate = useTranslate();
  const { calcPrice } = useCalcPrice();

  return (
    <FormDataConsumer>
      {({ formData }) => {
        // Only show price if required fields are present
        if (!formData.pages || !formData.paper_type_id) {
          return null;
        }

        // Create a record object that matches the expected structure
        const record = {
          pages: Number(formData.pages) || 0,
          paper_type_id: formData.paper_type_id,
          coverless: formData.coverless || false,
          two_faces_cover: formData.two_faces_cover || false,
          do_round: formData.do_round ?? true,
          change_price: formData.change_price || { oneFacePrice: 0, twoFacesPrice: 0 },
        } as any;

        const { price } = calcPrice({ record });

        return (
          <Box
            sx={{
              position: 'fixed',
              bottom: 65,
              left: 280,
              transform: 'translateX(-50%)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                boxShadow: 3,
                textAlign: 'center',
                minWidth: 120,
              }}
            >
              <Typography variant="body2" sx={{ fontFamily: 'inherit', fontWeight: 300 }}>
                وجه واحد: {toArabicNumerals(price.oneFacePrice)} ج.م
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                boxShadow: 3,
                textAlign: 'center',
                minWidth: 120,
              }}
            >
              <Typography variant="body2" sx={{ fontFamily: 'inherit', fontWeight: 300 }}>
                وجهين: {toArabicNumerals(price.twoFacesPrice)} ج.م
              </Typography>
            </Box>
          </Box>
        );
      }}
    </FormDataConsumer>
  );
};
