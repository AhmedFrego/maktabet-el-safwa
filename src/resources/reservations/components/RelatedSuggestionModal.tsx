import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import { GroupWork, Add, ShoppingCart } from '@mui/icons-material';
import { useTranslate } from 'react-admin';

import { toArabicNumerals } from 'utils';
import { fetchGroupPublications } from 'utils/helpers/syncRelatedPublications';
import { useCalcPrice, useCalcGroupPrice } from 'hooks';
import { useAppDispatch, addOrIncreaseItem } from 'store';
import { Publication } from 'resources/publications';

interface RelatedSuggestionModalProps {
  open: boolean;
  onClose: () => void;
  triggerPublication: Publication;
  relatedIds: string[];
}

export const RelatedSuggestionModal = ({
  open,
  onClose,
  triggerPublication,
  relatedIds,
}: RelatedSuggestionModalProps) => {
  const translate = useTranslate();
  const dispatch = useAppDispatch();
  const { calcPrice } = useCalcPrice();
  const { calcGroupPrice } = useCalcGroupPrice();

  const [loading, setLoading] = useState(false);
  const [relatedPublications, setRelatedPublications] = useState<Publication[]>([]);

  // Fetch related publications when modal opens
  useEffect(() => {
    const fetchRelated = async () => {
      if (!open || relatedIds.length === 0) return;

      setLoading(true);
      try {
        const { data, error } = await fetchGroupPublications(relatedIds);
        if (error) throw new Error(error);
        setRelatedPublications((data as Publication[]) || []);
      } catch (error) {
        console.error('Error fetching related publications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [open, relatedIds]);

  // Calculate individual prices for display
  const getPublicationPrice = (pub: Publication) => {
    const result = calcPrice({ record: pub });
    return result.price.twoFacesPrice;
  };

  // Calculate group price
  const allGroupPublications = [triggerPublication, ...relatedPublications];
  const groupPriceResult = calcGroupPrice(
    allGroupPublications.map((pub) => ({
      record: pub,
      quantity: 1,
    }))
  );

  // Sum of individual prices (with individual rounding)
  const individualTotal = allGroupPublications.reduce(
    (sum, pub) => sum + getPublicationPrice(pub),
    0
  );

  // Group total (with single rounding at the end)
  const groupTotal = groupPriceResult.groupTotal.twoFacesPrice;

  // Savings
  const savings = individualTotal - groupTotal;

  const handleAddSingle = (pub: Publication) => {
    const prices = calcPrice({ record: pub });
    const title = getPublicationTitle(pub);

    dispatch(
      addOrIncreaseItem({
        ...pub,
        title,
        price: prices.price.twoFacesPrice,
        cover_type_id: prices.cover?.id,
        cover_type: { name: prices.cover?.name },
      })
    );
  };

  const handleAddAll = () => {
    // Add all related publications with group pricing
    allGroupPublications.forEach((pub) => {
      const prices = calcPrice({ record: pub });
      const title = getPublicationTitle(pub);

      dispatch(
        addOrIncreaseItem({
          ...pub,
          title,
          price: prices.price.twoFacesPrice,
          cover_type_id: prices.cover?.id,
          cover_type: { name: prices.cover?.name },
        })
      );
    });
    onClose();
  };

  const getPublicationTitle = (pub: Publication) => {
    const academicShortName = translate(
      `custom.labels.academic_years.${pub.academic_year}.short_name`
    );
    const termName = translate(`custom.labels.terms.${pub.term}.name`);
    return `${pub.subject?.name || ''} ${pub.additional_data || ''} ${pub.publisher?.name || ''} ${academicShortName} ${termName}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupWork color="primary" />
          <Typography variant="h6">منشورات ذات صلة</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Already added publication */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                تم إضافته للسلة:
              </Typography>
              <Card variant="outlined" sx={{ bgcolor: 'success.light', opacity: 0.8 }}>
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="body1">{getPublicationTitle(triggerPublication)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    السعر: {toArabicNumerals(getPublicationPrice(triggerPublication))} ج.م
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Related publications */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              منشورات مرتبطة ({toArabicNumerals(relatedPublications.length)}):
            </Typography>

            <Grid container spacing={2}>
              {relatedPublications.map((pub) => (
                <Grid size={{ xs: 12, sm: 6 }} key={pub.id}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 1.5 }}>
                      <Typography variant="body1" noWrap>
                        {getPublicationTitle(pub)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Chip
                          label={`${toArabicNumerals(getPublicationPrice(pub))} ج.م`}
                          size="small"
                          color="primary"
                        />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ pt: 0 }}>
                      <Button size="small" startIcon={<Add />} onClick={() => handleAddSingle(pub)}>
                        إضافة للسلة
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Group pricing summary */}
            {relatedPublications.length > 0 && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: 'primary.light',
                  borderRadius: 2,
                  color: 'primary.contrastText',
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  سعر المجموعة الكاملة:
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>مجموع الأسعار المنفصلة:</Typography>
                  <Typography>{toArabicNumerals(individualTotal)} ج.م</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontWeight="bold">سعر المجموعة:</Typography>
                  <Typography fontWeight="bold">{toArabicNumerals(groupTotal)} ج.م</Typography>
                </Box>
                {savings > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="success.dark">التوفير:</Typography>
                    <Typography color="success.dark" fontWeight="bold">
                      {toArabicNumerals(savings)} ج.م
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{translate('ra.action.close')}</Button>
        {relatedPublications.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<ShoppingCart />}
            onClick={handleAddAll}
          >
            إضافة الكل للسلة ({toArabicNumerals(allGroupPublications.length)})
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
