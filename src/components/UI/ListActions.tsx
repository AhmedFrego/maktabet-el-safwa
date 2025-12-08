import { styled, ButtonGroup, Button, Checkbox } from '@mui/material';
import {
  CreateButton,
  TopToolbar,
  useListContext,
  useDataProvider,
  useTranslate,
} from 'react-admin';
import { DeleteForever, Close } from '@mui/icons-material';
import { useState } from 'react';
import { useAppDispatch, useAppSelector, toggleDeletingMode, toggleAllItems } from 'store';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { toArabicNumerals } from 'utils';

export const ListActions = () => {
  const dispatch = useAppDispatch();
  const translate = useTranslate();
  const { isDeletingMode, itemsToDelete } = useAppSelector((state) => state.deletion);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoadingAllIds, setIsLoadingAllIds] = useState(false);
  const { filterValues, total, data } = useListContext();
  const dataProvider = useDataProvider();

  const handleDeleteClick = () => {
    if (!isDeletingMode) {
      dispatch(toggleDeletingMode());
    } else if (itemsToDelete.length > 0) {
      setShowConfirmation(true);
    }
  };

  const handleSelectAll = async () => {
    if (isLoadingAllIds) return;

    setIsLoadingAllIds(true);
    try {
      const { data: allPublications } = await dataProvider.getList('publications', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'id', order: 'ASC' },
        filter: filterValues,
      });
      const allIds = allPublications.map((pub: { id: string }) => pub.id);
      dispatch(toggleAllItems(allIds));
    } catch (error) {
      console.error('Failed to fetch all publications:', error);
    } finally {
      setIsLoadingAllIds(false);
    }
  };

  return (
    <StyledTopToolbar>
      <ButtonGroup variant="contained" aria-label="Basic button group">
        {!isDeletingMode && <StyledCreateButton />}
        <StyledDeleteButton
          onClick={handleDeleteClick}
          color="error"
          disabled={isDeletingMode && itemsToDelete.length === 0}
          sx={{ cursor: isDeletingMode && itemsToDelete.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          <DeleteForever />
          {translate('ra.action.delete')}
          {isDeletingMode &&
            itemsToDelete.length > 0 &&
            `(${toArabicNumerals(itemsToDelete.length)})`}
        </StyledDeleteButton>
        {isDeletingMode && (
          <>
            <StyledSelectAllButton
              onClick={handleSelectAll}
              disabled={isLoadingAllIds}
              color="info"
            >
              <Checkbox
                checked={
                  (data?.length ?? 0) > 0 &&
                  data?.every((item: { id: string }) => itemsToDelete.includes(item.id))
                }
                indeterminate={
                  itemsToDelete.length > 0 &&
                  data?.some((item: { id: string }) => itemsToDelete.includes(item.id)) &&
                  !data?.every((item: { id: string }) => itemsToDelete.includes(item.id))
                }
                disabled={isLoadingAllIds}
                sx={{ padding: 0, marginRight: 0.5 }}
              />
              {isLoadingAllIds
                ? translate('ra.page.loading')
                : `${translate('ra.action.select_all')} (${toArabicNumerals(total || 0)})`}
            </StyledSelectAllButton>
            <StyledCancelButton color="success" onClick={() => dispatch(toggleDeletingMode())}>
              <Close />
              {translate('ra.action.cancel')}
            </StyledCancelButton>
          </>
        )}
      </ButtonGroup>
      <DeleteConfirmationModal open={showConfirmation} onClose={() => setShowConfirmation(false)} />
    </StyledTopToolbar>
  );
};

const StyledCreateButton = styled(CreateButton)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  fontWeight: 900,
}));

const StyledDeleteButton = styled(Button)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  fontWeight: 900,
}));

const StyledSelectAllButton = styled(Button)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  fontWeight: 900,
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  fontWeight: 900,
}));

const StyledTopToolbar = styled(TopToolbar)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  backgroundColor: theme.palette.grey[100],
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0',
}));
