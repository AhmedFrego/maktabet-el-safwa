import { Modal, Box, Typography, IconButton, Grid, Paper, Divider } from '@mui/material';
import { Close, Star } from '@mui/icons-material';
import { useTranslate } from 'react-admin';
import { useNavigate } from 'react-router';

import { DEFAULT_COVER_URL } from 'types';
import { toArabicNumerals } from 'utils';
import { useCalcPrice } from 'hooks/useCalcPrice';

import { Publication } from '..';

interface CollectionModalProps {
  open: boolean;
  onClose: () => void;
  masterPublication: Publication;
  relatedItems: Publication[];
}

export const CollectionModal = ({
  open,
  onClose,
  masterPublication,
  relatedItems,
}: CollectionModalProps) => {
  const translate = useTranslate();
  const { calcPrice } = useCalcPrice();
  const navigate = useNavigate();

  const handleItemClick = (itemId: string) => {
    onClose();
    navigate(`/publications/${itemId}/show`);
  };

  // All items in the collection (master + related)
  const allItems = [masterPublication, ...relatedItems];

  // Calculate total price
  const totalPrice = allItems.reduce((sum, item) => {
    const itemPrice = calcPrice({ record: item });
    return sum + itemPrice.price.twoFacesPrice;
  }, 0);

  const getItemPrice = (item: Publication) => {
    const prices = calcPrice({ record: item });
    return prices.price.twoFacesPrice;
  };

  // Build modal title from master publication
  const academicName = translate(
    `custom.labels.academic_years.${masterPublication.academic_year}.name`
  );
  const modalTitle = `${masterPublication.subject.name} ${masterPublication.publisher.name} ${academicName}`;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '80%', md: '70%' },
          maxWidth: 800,
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <Typography variant="h6" sx={{ fontFamily: 'inherit' }}>
            {modalTitle} ({toArabicNumerals(allItems.length)})
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
            <Close />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
          <Grid container spacing={2}>
            {allItems.map((item) => {
              const isMaster = item.is_collection_master === true;
              const price = getItemPrice(item);

              return (
                <Grid size={{ xs: 12, sm: 6 }} key={item.id}>
                  <Paper
                    elevation={isMaster ? 4 : 1}
                    onClick={() => handleItemClick(item.id)}
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      gap: 1.5,
                      border: isMaster ? '2px solid' : '1px solid',
                      borderColor: isMaster ? 'warning.main' : 'divider',
                      backgroundColor: 'background.paper',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: 4,
                      },
                    }}
                  >
                    {/* Cover Image */}
                    <Box
                      sx={{
                        width: 60,
                        height: 85,
                        flexShrink: 0,
                        borderRadius: 1,
                        overflow: 'hidden',
                        boxShadow: 1,
                      }}
                    >
                      <img
                        src={item.cover_url || DEFAULT_COVER_URL}
                        alt={item.additional_data || ''}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>

                    {/* Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        {isMaster && <Star fontSize="small" sx={{ color: 'warning.main' }} />}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isMaster ? 'bold' : 'normal',
                            fontFamily: 'inherit',
                          }}
                          noWrap
                        >
                          {item.additional_data || item.subject.name}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'bold',
                          color: 'primary.main',
                          mt: 0.5,
                        }}
                      >
                        {toArabicNumerals(price)} {translate('custom.currency.short')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {toArabicNumerals(item.pages)} {translate('custom.labels.pages_count')}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Footer with total */}
        <Divider />
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'grey.100',
          }}
        >
          <Typography variant="body1" sx={{ fontFamily: 'inherit' }}>
            {translate('resources.publications.messages.group_total')}:
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              fontFamily: 'inherit',
            }}
          >
            {toArabicNumerals(totalPrice)} {translate('custom.currency.long')}
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};
