import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { AutocompleteInput, BooleanInput, useGetList, useTranslate } from 'react-admin';

import { NumericTextInput } from 'components/form';
import { useCalcPrice, useGetCovers } from 'hooks';
import { modifyItem, ReservationRecord, useAppDispatch } from 'store';
import { Tables } from 'types';
import { toArabicNumerals } from 'utils';

export const ReservedItem = ({ item }: { item: ReservationRecord }) => {
  const translate = useTranslate();
  const dispatch = useAppDispatch();
  const { calcPrice } = useCalcPrice();
  const [expanded, setExpanded] = useState(false);
  const { data: paper_types } = useGetList<Tables<'paper_types'>>('paper_types');

  const { getCovers } = useGetCovers();
  const paperTypeId = item.paper_type_id || '';
  const recordForCalc = { ...item, paper_type_id: paperTypeId };
  const { covers } = getCovers(paperTypeId);

  const isManualPrice = item.manualPrice != null;

  return (
    <StyledReservedItem expanded={expanded} onChange={(_, next) => setExpanded(next)}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 3,
            width: '100%',
          }}
        >
          <Typography>{`${toArabicNumerals(item.quantity)} * ${toArabicNumerals(item.title)}`}</Typography>
          <Typography color="textSecondary">
            {`${toArabicNumerals(item.totalPrice)} ${translate('custom.currency.short')}`}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Box>
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <AutocompleteInput
              choices={paper_types}
              variant="standard"
              source="paper_type_id"
              label={translate('resources.publications.fields.paper_type')}
              defaultValue={item.paper_type_id}
              onChange={(value) => {
                const nextPaperTypeId = (value as string) || '';
                const { price, cover } = calcPrice({
                  record: recordForCalc,
                  paperTypeId: nextPaperTypeId,
                });
                const computedUnitPrice = price[item.isDublix ? 'twoFacesPrice' : 'oneFacePrice'];
                const chosenPaperTypeName = paper_types?.find(
                  (x) => x.id === nextPaperTypeId
                )?.name;
                dispatch(
                  modifyItem({
                    id: item.id,
                    paper_type_id: nextPaperTypeId,
                    paper_type: { name: chosenPaperTypeName },
                    ...(isManualPrice
                      ? {
                          totalPrice: (item.manualPrice ?? item.price ?? 0) * item.quantity,
                        }
                      : {
                          price: computedUnitPrice,
                          totalPrice: computedUnitPrice * item.quantity,
                        }),
                    cover_type_id: cover?.id,
                    cover_type: { name: cover?.name },
                  })
                );
              }}
            />
            <AutocompleteInput
              fullWidth
              choices={covers}
              variant="standard"
              source="cover_type_id"
              label={translate('resources.publications.fields.cover_type')}
              defaultValue={item.cover_type_id || covers?.[0]}
              onChange={(value) => {
                const nextCoverId = value as string;
                const { price, cover } = calcPrice({ record: recordForCalc, coverId: nextCoverId });
                const computedUnitPrice = price[item.isDublix ? 'twoFacesPrice' : 'oneFacePrice'];

                dispatch(
                  modifyItem({
                    id: item.id,
                    ...(isManualPrice
                      ? {
                          totalPrice: (item.manualPrice ?? item.price ?? 0) * item.quantity,
                        }
                      : {
                          price: computedUnitPrice,
                          totalPrice: computedUnitPrice * item.quantity,
                        }),
                    cover_type_id: cover?.id,
                    cover_type: { name: cover?.name },
                  })
                );
              }}
            />
          </Box>
          <BooleanInput
            source="is_duplix"
            label={translate('resources.publications.fields.dublix')}
            checked={item.isDublix}
            onChange={() => {
              const computedUnitPrice = calcPrice({ record: recordForCalc }).price[
                !item.isDublix ? 'twoFacesPrice' : 'oneFacePrice'
              ];
              dispatch(
                modifyItem({
                  id: item.id,
                  isDublix: !item.isDublix,
                  ...(isManualPrice
                    ? {
                        totalPrice: (item.manualPrice ?? item.price ?? 0) * item.quantity,
                      }
                    : {
                        price: computedUnitPrice,
                        totalPrice: computedUnitPrice * item.quantity,
                      }),
                })
              );
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mt: 1, width: '100%' }}>
            <NumericTextInput
              fullWidth
              size="small"
              label={translate('custom.labels.quantity')}
              value={item.quantity}
              onValueChange={(raw) => {
                if (raw === '') return;
                const nextQuantity = Math.max(1, Number(raw));
                if (Number.isNaN(nextQuantity)) return;

                const unitPrice = item.manualPrice ?? item.price ?? 0;
                dispatch(
                  modifyItem({
                    id: item.id,
                    quantity: nextQuantity,
                    totalPrice: unitPrice * nextQuantity,
                  })
                );
              }}
              sx={{ flex: 1 }}
              inputProps={{ min: 1 }}
            />

            <NumericTextInput
              fullWidth
              size="small"
              label={translate('resources.reservations.fields.unit_price')}
              value={item.manualPrice ?? item.price ?? ''}
              onValueChange={(raw) => {
                // Empty => revert to auto-calculated price
                if (raw === '') {
                  const computedUnitPrice = calcPrice({ record: recordForCalc }).price[
                    item.isDublix ? 'twoFacesPrice' : 'oneFacePrice'
                  ];
                  dispatch(
                    modifyItem({
                      id: item.id,
                      manualPrice: null,
                      price: computedUnitPrice,
                      totalPrice: computedUnitPrice * item.quantity,
                    })
                  );
                  return;
                }

                const unitPrice = Number(raw);
                if (Number.isNaN(unitPrice)) return;
                dispatch(
                  modifyItem({
                    id: item.id,
                    manualPrice: unitPrice,
                    price: unitPrice,
                    totalPrice: unitPrice * item.quantity,
                  })
                );
              }}
              sx={{ flex: 1 }}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={2}
            size="small"
            label={translate('resources.reservations.fields.note')}
            value={item.note ?? ''}
            onChange={(e) => {
              dispatch(modifyItem({ id: item.id, note: e.target.value }));
            }}
            sx={{ mt: 1 }}
          />
        </Box>
      </AccordionDetails>
    </StyledReservedItem>
  );
};

const StyledReservedItem = styled(Accordion)(({ theme }) => ({
  backgroundColor: 'transparent',
  borderRadius: 6,
  boxShadow: 'none',
  '&::before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-root': {
    paddingInline: 15,
    minHeight: theme.spacing(6),
    backgroundColor: theme.palette.grey[100],
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  '& .MuiAccordionSummary-content': {
    marginBlock: 8,
  },
  '& .MuiAccordionDetails-root': {
    paddingInline: 15,
    paddingBottom: 12,
    paddingTop: 4,
    backgroundColor: theme.palette.background.default,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
}));
