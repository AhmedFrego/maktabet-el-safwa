import { useState, useRef } from 'react';
import { Typography, CardProps, Checkbox, Tooltip, Box, Badge } from '@mui/material';
import { Remove, Add, DeleteForever, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router';

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
  CollectionModal,
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
  const navigate = useNavigate();
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { additional_data, subject, term, cover_url, publisher } = record;
  const prices = calcPrice({ record });
  const academicShortName = translate(
    `custom.labels.academic_years.${record.academic_year}.short_name`
  );

  // Calculate group price (master + all related items)
  const groupPrice =
    relatedItems.length > 0
      ? prices.price.twoFacesPrice +
        relatedItems.reduce((sum, item) => {
          const itemPrice = calcPrice({ record: item });
          return sum + itemPrice.price.twoFacesPrice;
        }, 0)
      : prices.price.twoFacesPrice;

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
      related_publications: (record.related_publications as string[]) || null,
    };

    // If publication has related items and this is the first time adding it, show suggestion modal
    if (hasRelatedPublications && !isReserved) {
      dispatch(
        setPendingSuggestion({
          triggerPublication: itemData,
          relatedIds: (record.related_publications as string[]) || [],
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

  // Handle double-click to show collection modal
  const handleDoubleClick = (e: React.MouseEvent) => {
    // Only show modal for masters with related items, not in reserving/deleting modes
    if (hasStackedItems && !isReserving && !isDeletingMode) {
      e.preventDefault();
      e.stopPropagation();
      // Cancel any pending single-click navigation
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      setShowCollectionModal(true);
    }
  };

  // Handle single click - navigate to show page (with delay for stacked cards)
  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate in reserving or deleting modes, or if modal is open
    if (isReserving || isDeletingMode || showCollectionModal) return;

    // If this card has stacked items, delay navigation to allow double-click detection
    if (hasStackedItems) {
      e.preventDefault();
      e.stopPropagation();

      // Cancel previous timeout if clicking rapidly
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }

      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        navigate(`/publications/${record.id}/show`);
      }, 300); // 300ms delay to detect double-click
    } else {
      // For non-stacked cards, navigate immediately
      navigate(`/publications/${record.id}/show`);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <StyledCard
        {...props}
        sx={{
          position: 'relative',
          ...props.sx,
        }}
      >
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
          {/* Price tag with master indicator and group count badge */}
          <Tooltip
            title={
              hasStackedItems
                ? `${translate('resources.publications.messages.collection_items')}: ${toArabicNumerals(relatedItems.length + 1)}`
                : ''
            }
          >
            <Badge
              badgeContent={hasStackedItems ? toArabicNumerals(relatedItems.length + 1) : 0}
              color="secondary"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  minWidth: 20,
                  height: 20,
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                {/* Master indicator */}
                {isMaster && (
                  <Tooltip
                    title={translate('resources.publications.messages.is_collection_master')}
                  >
                    <Star fontSize="small" sx={{ color: 'warning.main' }} />
                  </Tooltip>
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontFamily: 'inherit',
                    lineHeight: 1,
                  }}
                >
                  {toArabicNumerals(groupPrice)} {translate('custom.currency.short')}
                </Typography>
              </Box>
            </Badge>
          </Tooltip>
          <CoverImage src={cover_url || DEFAULT_COVER_URL} alt={title} />
          <Typography variant="body2" noWrap>
            {`${subject.name}${additional_data ? ` (${additional_data})` : ''}`}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {publisher.name}
          </Typography>
        </StyledCardContent>
      </StyledCard>

      {/* Collection Preview Modal */}
      {hasStackedItems && (
        <CollectionModal
          open={showCollectionModal}
          onClose={() => setShowCollectionModal(false)}
          masterPublication={record}
          relatedItems={relatedItems}
        />
      )}
    </Box>
  );
};
