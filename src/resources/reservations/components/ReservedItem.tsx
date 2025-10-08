import { Edit, SaveAs } from '@mui/icons-material';
import { Box, IconButton, styled, Typography } from '@mui/material';
import { useState } from 'react';
import { AutocompleteInput, BooleanInput, useGetList, useTranslate } from 'react-admin';

import { useCalcPrice, useGetCovers } from 'hooks';
import { modifyItem, ReservationRecord, useAppDispatch } from 'store';
import { Tables } from 'types';
import { toArabicNumerals } from 'utils';

export const ReservedItem = ({ item }: { item: ReservationRecord }) => {
  const translate = useTranslate();
  const dispatch = useAppDispatch();
  const { calcPrice } = useCalcPrice();
  const [editing, setEditing] = useState(false);
  const { data: paper_types } = useGetList<Tables<'paper_types'>>('paper_types');

  const { getCovers } = useGetCovers();
  const { covers } = getCovers(item.paper_type_id);

  return (
    <StyledReservedItem>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
        <Typography>{`${toArabicNumerals(item.quantity)} * ${item.title}`}</Typography>
        <Typography color="textSecondary">
          {`${toArabicNumerals(item.totalPrice)} ${translate('custom.currency.short')}`}
          <IconButton aria-label="delete">
            {editing ? (
              <SaveAs color="success" onClick={() => setEditing(false)} />
            ) : (
              <Edit color="info" onClick={() => setEditing(true)} />
            )}
          </IconButton>
        </Typography>
      </Box>
      {/* <Box sx={{ display: 'flex', gap: 2 }}>
        <Typography>{`${translate('resources.publications.fields.paper_type')}: ${item.paper_type.name}`}</Typography>
        <Typography>{`${translate('resources.publications.fields.cover_type')}: ${item.cover_type?.name}`}</Typography>
      </Box> */}
      {editing && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <AutocompleteInput
              choices={paper_types}
              variant="standard"
              source="paper_type_id"
              label={translate('resources.publications.fields.paper_type')}
              defaultValue={item.paper_type_id}
              onChange={(value) => {
                const { price, cover } = calcPrice({ record: item, paperTypeId: value });
                dispatch(
                  modifyItem({
                    id: item.id,
                    paper_type_id: value,
                    paper_type: paper_types?.find((x) => x.id === value),
                    price: price[item.isDublix ? 'twoFacesPrice' : 'oneFacePrice'],
                    totalPrice:
                      price[item.isDublix ? 'twoFacesPrice' : 'oneFacePrice'] * item.quantity,
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
                const { price, cover } = calcPrice({ record: item, coverId: value });

                dispatch(
                  modifyItem({
                    id: item.id,
                    price: price[item.isDublix ? 'twoFacesPrice' : 'oneFacePrice'],
                    totalPrice:
                      price[item.isDublix ? 'twoFacesPrice' : 'oneFacePrice'] * item.quantity,
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
              const price = calcPrice({ record: item }).price[
                !item.isDublix ? 'twoFacesPrice' : 'oneFacePrice'
              ];
              dispatch(
                modifyItem({
                  id: item.id,
                  isDublix: !item.isDublix,
                  price,
                  totalPrice: price * item.quantity,
                })
              );
            }}
          />
        </Box>
      )}
    </StyledReservedItem>
  );
};

const StyledReservedItem = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  paddingBlock: 5,
  paddingInline: 15,
  borderRadius: 5,
}));
