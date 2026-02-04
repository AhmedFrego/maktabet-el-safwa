import { Typography, CardProps, Checkbox, Tooltip, Badge, Box } from '@mui/material';
import { Remove, Add, DeleteForever, Star } from '@mui/icons-material';

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

interface PublicationCardProps extends CardProps {
  record: Publication;
  relatedItems?: Publication[];
}

export const PublicationCard = ({ record, relatedItems = [], ...props }: PublicationCardProps) => {
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
  const isMaster = record.is_collection_master === true;
  const hasStackedItems = relatedItems.length > 0;

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

  // Render stacked background cards for related items
  const renderStackedBackground = () => {
    if (!hasStackedItems) return null;

    // Show max 2 stacked cards behind
    const stackCount = Math.min(relatedItems.length, 2);

    return (
      <>
        {Array.from({ length: stackCount }).map((_, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: (index + 1) * 4,
              right: (index + 1) * -4,
              width: '100%',
              height: '100%',
              backgroundColor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1,
              zIndex: -1 - index,
              opacity: 0.8 - index * 0.2,
            }}
          />
        ))}
      </>
    );
  };

  return (
    <Box
      sx={{
        position: 'relative',
        mb: hasStackedItems ? 1 : 0,
        mr: hasStackedItems ? 1 : 0,
      }}
    >
      {renderStackedBackground()}
      <StyledCard {...props} sx={{ position: 'relative', zIndex: 1, ...props.sx }}>
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
          {/* Master indicator */}
          {isMaster && (
            <Tooltip title={translate('resources.publications.messages.is_collection_master')}>
              <Star
                fontSize="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  color: 'warning.main',
                }}
              />
            </Tooltip>
          )}
          {/* Stacked items count badge */}
          {hasStackedItems && (
            <Tooltip
              title={`${translate('resources.publications.messages.collection_items')}: ${toArabicNumerals(relatedItems.length + 1)}`}
            >
              <Badge
                badgeContent={toArabicNumerals(relatedItems.length + 1)}
                color="secondary"
                sx={{
                  position: 'absolute',
                  top: isMaster ? 32 : 8,
                  left: 8,
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    minWidth: 18,
                    height: 18,
                  },
                }}
              />
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
    </Box>
  );
};
