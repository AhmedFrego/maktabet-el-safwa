import { Typography, CardProps } from '@mui/material';
import { Remove, Add, DeleteForever } from '@mui/icons-material';

import { DEFAULT_COVER_URL } from 'types';
import { useAppSelector, useAppDispatch, addOrIncreaseItem, decreaseItemQuantity } from 'store';
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

  const { additional_data, subject, academicYear, term, cover_url, publisher_data } = record;
  const price = calcPrice({ record }).price.twoFacesPrice;
  const title = `${subject.name} ${additional_data || ''} ${publisher_data.name} ${academicYear.short_name} ${term}`;

  const { isReserving, reservedItems } = useAppSelector((state) => state.reservation);
  const isReserved = reservedItems.find((item) => item.id === record.id);

  return (
    <StyledCard {...props}>
      {isReserving && (
        <StyledSelector>
          <StyledReserveQuantity>
            <Add
              fontSize="inherit"
              color="success"
              onClick={() => dispatch(addOrIncreaseItem({ ...record, price, title }))}
            />
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
      <StyledCardContent>
        <StyledChip label={toArabicNumerals(academicYear.short_name)} />
        <StyledTag>
          <span>{toArabicNumerals(price)}</span>
          <span>{translate('custom.currency.short')}</span>
        </StyledTag>
        <CoverImage src={cover_url || DEFAULT_COVER_URL} alt={title} />
        <Typography variant="body2" noWrap>
          {`${subject.name}${additional_data ? ` (${additional_data})` : ''}`}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {publisher_data.name}
        </Typography>
      </StyledCardContent>
    </StyledCard>
  );
};
