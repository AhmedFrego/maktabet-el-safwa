import { Add, DeleteForever, Edit, Remove, SaveAs } from '@mui/icons-material';
import { Box, IconButton, styled, Typography } from '@mui/material';
import { useState } from 'react';
import { AutocompleteInput, ReferenceInput, useTranslate } from 'react-admin';

import { addOrIncreaseItem, decreaseItemQuantity, ReservationRecord, useAppDispatch } from 'store';
import { toArabicNumerals } from 'utils';

export const ReservedItem = ({ item }: { item: ReservationRecord<unknown> }) => {
  const translate = useTranslate();
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);

  return (
    <StyledReservedItem>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography>
          {`${toArabicNumerals(item.quantity)} * 
          ${item.title}`}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography>{item.paper_size.name}</Typography>
          <Typography>
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
      </Box>
      {editing && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Add
              fontSize="inherit"
              color="success"
              onClick={() => dispatch(addOrIncreaseItem(item))}
            />
            {
              <>
                {toArabicNumerals(item.quantity)}
                {item.quantity === 1 ? (
                  <DeleteForever
                    fontSize="inherit"
                    color="error"
                    onClick={() => dispatch(decreaseItemQuantity(item.id))}
                  />
                ) : (
                  <Remove
                    fontSize="inherit"
                    onClick={() => dispatch(decreaseItemQuantity(item.id))}
                  />
                )}
              </>
            }
          </Box>
          <ReferenceInput source="paper_size" reference="paper_sizes">
            <AutocompleteInput
              sx={{ width: 'fit-content' }}
              variant="standard"
              label={translate('custom.labels.paper_size')}
              filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
              defaultValue={item.default_paper_size}
            />
          </ReferenceInput>
        </Box>
      )}
    </StyledReservedItem>
  );
};

const StyledReservedItem = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  paddingBlock: theme.spacing(1.5),
  paddingInline: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
}));
