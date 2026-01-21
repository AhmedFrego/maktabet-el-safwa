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
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
} from '@mui/material';
import { GroupWork, ShoppingCart } from '@mui/icons-material';
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set([triggerPublication.id]));

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

    if (open) {
      setSelectedIds(new Set([triggerPublication.id]));
      fetchRelated();
    }
  }, [open, relatedIds, triggerPublication.id]);

  // Calculate individual prices for display
  const getPublicationPrice = (pub: Publication) => {
    const result = calcPrice({ record: pub });
    return result.price.twoFacesPrice;
  };

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

  const handleTogglePublication = (pubId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pubId)) {
        // Don't allow unchecking trigger publication
        if (pubId === triggerPublication.id) return prev;
        newSet.delete(pubId);
      } else {
        newSet.add(pubId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allIds = [triggerPublication.id, ...relatedPublications.map((p) => p.id)];
    setSelectedIds(new Set(allIds));
  };

  const handleAddSelected = () => {
    const publicationsToAdd = [triggerPublication, ...relatedPublications].filter((pub) =>
      selectedIds.has(pub.id)
    );

    publicationsToAdd.forEach((pub) => {
      handleAddSingle(pub);
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
          <Typography variant="inherit">منشورات ذات صلة</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Publications list with checkboxes */}
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  اختر المنشورات للإضافة:
                </Typography>
                <Button size="small" onClick={handleSelectAll}>
                  تحديد الكل
                </Button>
              </Box>

              <List
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                {/* Trigger publication - always first and checked */}
                <ListItem
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'info.light',
                    opacity: 0.9,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedIds.has(triggerPublication.id)}
                        onChange={() => handleTogglePublication(triggerPublication.id)}
                        disabled
                      />
                    }
                    label={
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body1">
                          {getPublicationTitle(triggerPublication)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          السعر: {toArabicNumerals(getPublicationPrice(triggerPublication))} ج.م
                        </Typography>
                      </Box>
                    }
                    sx={{ width: '100%', mr: 0 }}
                  />
                </ListItem>

                {/* Related publications */}
                {relatedPublications.map((pub) => (
                  <ListItem
                    key={pub.id}
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 0 },
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedIds.has(pub.id)}
                          onChange={() => handleTogglePublication(pub.id)}
                        />
                      }
                      label={
                        <Box sx={{ width: '100%' }}>
                          <Typography variant="body1">{getPublicationTitle(pub)}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            السعر: {toArabicNumerals(getPublicationPrice(pub))} ج.م
                          </Typography>
                        </Box>
                      }
                      sx={{ width: '100%', mr: 0 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Group pricing summary for selected items */}
            {selectedIds.size > 1 && (
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
                  سعر المجموعة المحددة:
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>عدد المنشورات:</Typography>
                  <Typography>{toArabicNumerals(selectedIds.size)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>مجموع الأسعار المنفصلة:</Typography>
                  <Typography>
                    {toArabicNumerals(
                      [...selectedIds].reduce((sum, id) => {
                        const pub = [triggerPublication, ...relatedPublications].find(
                          (p) => p.id === id
                        );
                        return sum + (pub ? getPublicationPrice(pub) : 0);
                      }, 0)
                    )}{' '}
                    ج.م
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontWeight="bold">سعر المجموعة:</Typography>
                  <Typography fontWeight="bold">
                    {toArabicNumerals(
                      calcGroupPrice(
                        [...selectedIds].map((id) => {
                          const pub = [triggerPublication, ...relatedPublications].find(
                            (p) => p.id === id
                          );
                          return { record: pub!, quantity: 1 };
                        })
                      ).groupTotal.twoFacesPrice
                    )}{' '}
                    ج.م
                  </Typography>
                </Box>
                {(() => {
                  const selectedPubs = [...selectedIds]
                    .map((id) =>
                      [triggerPublication, ...relatedPublications].find((p) => p.id === id)
                    )
                    .filter(Boolean) as Publication[];
                  const selectedIndividualTotal = selectedPubs.reduce(
                    (sum, pub) => sum + getPublicationPrice(pub),
                    0
                  );
                  const selectedGroupTotal = calcGroupPrice(
                    selectedPubs.map((pub) => ({ record: pub, quantity: 1 }))
                  ).groupTotal.twoFacesPrice;
                  const selectedSavings = selectedIndividualTotal - selectedGroupTotal;
                  return selectedSavings > 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="success.dark">التوفير:</Typography>
                      <Typography color="success.dark" fontWeight="bold">
                        {toArabicNumerals(selectedSavings)} ج.م
                      </Typography>
                    </Box>
                  ) : null;
                })()}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ gap: 1 }}>
        <Button onClick={onClose}>{translate('ra.action.close')}</Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ShoppingCart />}
          onClick={handleAddSelected}
        >
          {selectedIds.size === 1
            ? 'إضافة المنشور المحدد'
            : `إضافة المحددة (${toArabicNumerals(selectedIds.size)})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
