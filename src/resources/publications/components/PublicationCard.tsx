import { Typography, CardProps, Checkbox, Tooltip, Badge } from '@mui/material';
import { Remove, Add, DeleteForever, GroupWork } from '@mui/icons-material';

import { DEFAULT_COVER_URL } from 'types';
import {
  useAppSelector,
  useAppDispatch,
  addOrIncreaseItem,
  decreaseItemQuantity,
  addItemToDelete,
  removeItemFromDelete,
  setPendingSuggestion,
} from 'store';
import { toArabicNumerals } from 'utils';
import {
  CoverImage,
  Publication,
  StyledCard,
  StyledCardContent,
  StyledChip,
  StyledReserveQuantity,
  StyledSelector,
  StyledTag,
} from '..';
import { useCalcPrice } from 'hooks/useCalcPrice';
import { useTranslate } from 'react-admin';

export const PublicationCard = ({ record, ...props }: { record: Publication } & CardProps) => {
  const dispatch = useAppDispatch();
  const { calcPrice } = useCalcPrice();
  const translate = useTranslate();

  const { additional_data, subject, term, cover_url, publisher } = record;
  const prices = calcPrice({ record });
  const academicShortName = translate(
    `custom.labels.academic_years.${record.academic_year}.short_name`
  );

  const title = `${subject.name} ${additional_data || ''} ${publisher.name} ${academicShortName} ${translate(
    `custom.labels.terms.${term}.name`
  )}`;
  const { isReserving, reservedItems } = useAppSelector((state) => state.reservation);
  const { isDeletingMode, itemsToDelete } = useAppSelector((state) => state.deletion);
  const isReserved = reservedItems.find((item) => item.id === record.id);
  const isSelectedForDelete = itemsToDelete.includes(record.id);

  const hasRelatedPublications =
    record.related_publications && record.related_publications.length > 0;
  const relatedCount = record.related_publications?.length || 0;

  const handleAddToCart = () => {
    const itemData = {
      ...record,
      title,
      price: prices?.price?.twoFacesPrice,
      cover_type_id: prices?.cover?.id,
      cover_type: { name: prices.cover?.name },
    };

    // If publication has related items and this is the first time adding it, show suggestion modal
    if (hasRelatedPublications && !isReserved) {
      dispatch(
        setPendingSuggestion({
          triggerPublication: itemData,
          relatedIds: record.related_publications || [],
        })
      );
      return; // Don't add immediately, let modal handle it
    }

    // Add the item to cart (only if no related items or already reserved)
    dispatch(addOrIncreaseItem(itemData));
  };

  const handleDeleteToggle = () => {
    if (isSelectedForDelete) {
      dispatch(removeItemFromDelete(record.id));
    } else {
      dispatch(addItemToDelete(record.id));
    }
  };

  return (
    <StyledCard {...props}>
      {isReserving && (
        <StyledSelector>
          <StyledReserveQuantity>
            <Add fontSize="inherit" color="success" onClick={handleAddToCart} />
            {isReserved && (
              <>
                {toArabicNumerals(isReserved?.quantity)}
                {isReserved.quantity === 1 ? (
                  <DeleteForever
                    fontSize="inherit"
                    color="error"
                    onClick={() => dispatch(decreaseItemQuantity(record.id))}
                  />
                ) : (
                  <Remove
                    fontSize="inherit"
                    onClick={() => dispatch(decreaseItemQuantity(record.id))}
                  />
                )}
              </>
            )}
          </StyledReserveQuantity>
        </StyledSelector>
      )}
      {isDeletingMode && (
        <StyledSelector
          sx={(theme) => ({
            backgroundColor: isSelectedForDelete
              ? theme.palette.error.light
              : 'rgba(211, 47, 47, 0.08)',
          })}
        >
          <Checkbox
            checked={isSelectedForDelete}
            onChange={handleDeleteToggle}
            sx={(theme) => ({
              color: theme.palette.error.main,
              '&.Mui-checked': {
                color: theme.palette.error.main,
              },
            })}
          />
        </StyledSelector>
      )}
      <StyledCardContent>
        <StyledChip label={toArabicNumerals(academicShortName)} />
        {hasRelatedPublications && (
          <Tooltip title={`جزء من مجموعة (${toArabicNumerals(relatedCount + 1)} عناصر)`}>
            <Badge
              badgeContent={toArabicNumerals(relatedCount + 1)}
              color="secondary"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                '& .MuiBadge-badge': {
                  fontSize: '0.65rem',
                  minWidth: 18,
                  height: 18,
                },
              }}
            >
              <GroupWork fontSize="small" color="secondary" />
            </Badge>
          </Tooltip>
        )}
        <StyledTag>
          <span>{toArabicNumerals(prices.price.twoFacesPrice)}</span>
          <span>{translate('custom.currency.short')}</span>
        </StyledTag>
        <CoverImage src={cover_url || DEFAULT_COVER_URL} alt={title} />
        <Typography variant="body2" noWrap>
          {`${subject.name}${additional_data ? ` (${additional_data})` : ''}`}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {publisher.name}
        </Typography>
      </StyledCardContent>
    </StyledCard>
  );
};
