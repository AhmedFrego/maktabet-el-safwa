import { CopyAll, CropPortrait, Edit, SaveAs } from '@mui/icons-material';
import { Box, IconButton, styled, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
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
  const [isDuplix, setIsDuplix] = useState(true);
  const [coverId, setCoverId] = useState(item.coverId);
  const [paperTypeId, setPaperTypeId] = useState(item.paper_type_id);
  const { data: paper_types } = useGetList<Tables<'paper_types'>>('paper_types');

  const { getCovers } = useGetCovers();

  const covers = getCovers(paperTypeId).covers;

  const price = calcPrice({ record: item, coverId, paperTypeId }).price[
    isDuplix ? 'twoFacesPrice' : 'oneFacePrice'
  ];
  //

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
      {editing && (
        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
          <BooleanInput
            source="xxx"
            label={false}
            checked={isDuplix}
            onChange={() => {
              setIsDuplix((v) => !v);
              dispatch(
                modifyItem({
                  id: item.id,
                  isDuplix,
                  price: calcPrice({ record: item, coverId, paperTypeId }).price[
                    isDuplix ? 'twoFacesPrice' : 'oneFacePrice'
                  ],
                  totalPrice: price * item.quantity,
                })
              );
            }}
          />
          <AutocompleteInput
            choices={paper_types}
            variant="standard"
            source="paper_type_id"
            label={translate('resources.publications.fields.paper_type')}
            defaultValue={item.paper_type_id}
            onChange={(value) => {
              setPaperTypeId(() => value);

              const price = calcPrice({ record: item, paperTypeId: value, coverId: coverId }).price[
                isDuplix ? 'twoFacesPrice' : 'oneFacePrice'
              ];
              dispatch(
                modifyItem({ id: item.id, isDuplix, price, totalPrice: price * item.quantity })
              );
            }}
          />
          <AutocompleteInput
            fullWidth
            choices={covers}
            variant="standard"
            source="cover_type_id"
            label={translate('resources.publications.fields.paper_type')}
            defaultValue={covers?.[0]}
            onChange={(value) => {
              setCoverId(() => value);
              const price = calcPrice({ record: item, paperTypeId, coverId: value }).price[
                isDuplix ? 'twoFacesPrice' : 'oneFacePrice'
              ];

              dispatch(
                modifyItem({ id: item.id, isDuplix, price, totalPrice: price * item.quantity })
              );
              console.log(price);
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
