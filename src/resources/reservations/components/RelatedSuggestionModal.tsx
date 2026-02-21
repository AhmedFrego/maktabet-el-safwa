import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ButtonGroup,
  Box,
  Typography,
  CircularProgress,
  TextField,
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
  const [groupQuantity, setGroupQuantity] = useState<number>(1);

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
      setGroupQuantity(1);
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
        related_publications: (pub.related_publications as string[] | null) || null,
      })
    );
  };

  const handleTogglePublication = (pubId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pubId)) {
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

  const handleSelectAndAddAll = () => {
    const allIds = [triggerPublication.id, ...relatedPublications.map((p) => p.id)];
    setSelectedIds(new Set(allIds));

    const quantity = Math.min(50, Math.max(1, Math.floor(groupQuantity || 1)));
    const allPublications = [triggerPublication, ...relatedPublications];

    allPublications.forEach((pub) => {
      for (let i = 0; i < quantity; i += 1) {
        handleAddSingle(pub);
      }
    });

    onClose();
  };

  const handleAddSelected = () => {
    const quantity = Math.min(50, Math.max(1, Math.floor(groupQuantity || 1)));
    const publicationsToAdd = [triggerPublication, ...relatedPublications].filter((pub) =>
      selectedIds.has(pub.id)
    );

    publicationsToAdd.forEach((pub) => {
      for (let i = 0; i < quantity; i += 1) {
        handleAddSingle(pub);
      }
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
          <Typography variant="inherit" sx={{ fontFamily: 'inherit' }}>
            {translate('resources.publications.messages.related_publications_modal_title')}
          </Typography>
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
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontFamily: 'inherit' }}
                >
                  {translate('resources.publications.messages.select_publications_to_add')}
                </Typography>
                <Button size="small" onClick={handleSelectAll} sx={{ fontFamily: 'inherit' }}>
                  {translate('ra.action.select_all')}
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
                      />
                    }
                    label={
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body1" sx={{ fontFamily: 'inherit' }}>
                          {getPublicationTitle(triggerPublication)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontFamily: 'inherit' }}
                        >
                          {translate('resources.publications.messages.price_label')}:{' '}
                          {toArabicNumerals(getPublicationPrice(triggerPublication))}{' '}
                          {translate('custom.currency.short')}
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
                          <Typography variant="body1" sx={{ fontFamily: 'inherit' }}>
                            {getPublicationTitle(pub)}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontFamily: 'inherit' }}
                          >
                            {translate('resources.publications.messages.price_label')}:{' '}
                            {toArabicNumerals(getPublicationPrice(pub))}{' '}
                            {translate('custom.currency.short')}
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ fontFamily: 'inherit' }}>
                    {translate('resources.publications.messages.group_price_title')}:
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    label={translate('custom.labels.quantity')}
                    value={groupQuantity}
                    onChange={(e) => setGroupQuantity(Number(e.target.value))}
                    inputProps={{ min: 1, max: 50, step: 1 }}
                    sx={{
                      width: 120,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      '& .MuiInputLabel-root, & .MuiInputBase-input': { fontFamily: 'inherit' },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontFamily: 'inherit' }}>
                    {translate('resources.publications.messages.publications_count')}:
                  </Typography>
                  <Typography sx={{ fontFamily: 'inherit' }}>
                    {toArabicNumerals(selectedIds.size)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontFamily: 'inherit' }}>
                    {translate('resources.publications.messages.total_items_with_quantity')}:
                  </Typography>
                  <Typography sx={{ fontFamily: 'inherit' }}>
                    {toArabicNumerals(
                      selectedIds.size * Math.min(50, Math.max(1, Math.floor(groupQuantity || 1)))
                    )}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontFamily: 'inherit' }}>
                    {translate('resources.publications.messages.separate_prices_sum')}:
                  </Typography>
                  <Typography sx={{ fontFamily: 'inherit' }}>
                    {toArabicNumerals(
                      Math.min(50, Math.max(1, Math.floor(groupQuantity || 1))) *
                        [...selectedIds].reduce((sum, id) => {
                          const pub = [triggerPublication, ...relatedPublications].find(
                            (p) => p.id === id
                          );
                          return sum + (pub ? getPublicationPrice(pub) : 0);
                        }, 0)
                    )}{' '}
                    {translate('custom.currency.short')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontWeight="bold" sx={{ fontFamily: 'inherit' }}>
                    {translate('resources.publications.messages.group_price_label')}:
                  </Typography>
                  <Typography fontWeight="bold" sx={{ fontFamily: 'inherit' }}>
                    {toArabicNumerals(
                      calcGroupPrice(
                        [...selectedIds].map((id) => {
                          const pub = [triggerPublication, ...relatedPublications].find(
                            (p) => p.id === id
                          );
                          return {
                            record: pub!,
                            quantity: Math.min(50, Math.max(1, Math.floor(groupQuantity || 1))),
                          };
                        })
                      ).groupTotal.twoFacesPrice
                    )}{' '}
                    {translate('custom.currency.short')}
                  </Typography>
                </Box>
                {(() => {
                  const selectedPubs = [...selectedIds]
                    .map((id) =>
                      [triggerPublication, ...relatedPublications].find((p) => p.id === id)
                    )
                    .filter(Boolean) as Publication[];
                  const selectedIndividualTotal = selectedPubs.reduce(
                    (sum, pub) =>
                      sum +
                      Math.min(50, Math.max(1, Math.floor(groupQuantity || 1))) *
                        getPublicationPrice(pub),
                    0
                  );
                  const selectedGroupTotal = calcGroupPrice(
                    selectedPubs.map((pub) => ({
                      record: pub,
                      quantity: Math.min(50, Math.max(1, Math.floor(groupQuantity || 1))),
                    }))
                  ).groupTotal.twoFacesPrice;
                  const selectedSavings = selectedIndividualTotal - selectedGroupTotal;
                  return selectedSavings > 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="success.dark" sx={{ fontFamily: 'inherit' }}>
                        {translate('resources.publications.messages.savings_label')}:
                      </Typography>
                      <Typography
                        color="success.dark"
                        fontWeight="bold"
                        sx={{ fontFamily: 'inherit' }}
                      >
                        {toArabicNumerals(selectedSavings)} {translate('custom.currency.short')}
                      </Typography>
                    </Box>
                  ) : null;
                })()}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <ButtonGroup variant="contained">
          <Button onClick={onClose} color="error" sx={{ fontFamily: 'inherit' }}>
            {translate('ra.action.close')}
          </Button>
          <Button color="success" onClick={handleSelectAndAddAll} sx={{ fontFamily: 'inherit' }}>
            {translate('resources.publications.messages.select_and_add_all')}
          </Button>
          <Button
            color="primary"
            startIcon={<ShoppingCart />}
            onClick={handleAddSelected}
            disabled={selectedIds.size === 0}
            sx={{ fontFamily: 'inherit' }}
          >
            {selectedIds.size === 1
              ? translate('resources.publications.messages.add_selected_single')
              : `${translate('resources.publications.messages.add_selected_multiple')} (${toArabicNumerals(selectedIds.size)})`}
          </Button>
        </ButtonGroup>
      </DialogActions>
    </Dialog>
  );
};
