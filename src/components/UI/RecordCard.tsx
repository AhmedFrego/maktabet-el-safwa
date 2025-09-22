import { styled, alpha } from '@mui/material/styles';
import { CardContent, Chip, Typography, Card, CardProps, Box } from '@mui/material';
import { Remove, Add, DeleteForever } from '@mui/icons-material';

import { DEFAULT_COVER_URL } from 'types';
import {
  useAppSelector,
  useAppDispatch,
  addOrIncreaseItem,
  ReservationMustKeys,
  decreaseItemQuantity,
} from 'store';
import { toArabicNumerals } from 'utils';

export const RecordCard = <T extends ReservationMustKeys>({
  record,
  recordToCard,
  ...props
}: RecordCardProps<T>) => {
  const dispatch = useAppDispatch();
  const { bottomText, coverUrl, chipText, tagText } = recordToCard(record);
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
              onClick={() => dispatch(addOrIncreaseItem(record))}
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
        {chipText && <StyledChip label={chipText} />}
        {tagText && (
          <StyledTag>
            {tagText.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </StyledTag>
        )}
        <CoverImage src={coverUrl || DEFAULT_COVER_URL} alt={bottomText.start || 'cover image'} />
        <Typography variant="body2" noWrap>
          {bottomText.start}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {bottomText.end}
        </Typography>
      </StyledCardContent>
    </StyledCard>
  );
};

interface RecordCardProps<T extends ReservationMustKeys> extends CardProps {
  record: T;
  recordToCard: (record: T) => recordCardStructure;
}

export interface recordCardStructure {
  coverUrl: string | null;
  chipText?: string;
  tagText?: (string | number)[];
  bottomText: {
    start: string;
    end: string;
  };
}

const StyledCard = styled(Card)(({ theme }) => ({
  padding: '.3em',
  borderTopLeftRadius: theme.spacing(3),
  backgroundColor: theme.palette.grey[100],
  flexBasis: '10em',
  cursor: 'pointer',
  position: 'relative',
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  position: 'relative',
  borderTopLeftRadius: theme.spacing(3),
  overflow: 'hidden',
  transition: 'transform 160ms ease, box-shadow 160ms ease',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: '0',
  alignItems: 'center',
  '&.MuiCardContent-root': {
    paddingBottom: theme.spacing(1),
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const CoverImage = styled('img')(() => ({
  width: '100%',
  height: '13em',
  objectFit: 'cover',
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.secondary,
  top: '.5em',
  left: '.5em',
  position: 'absolute',
  fontWeight: '900',
  fontSize: '.6em',
}));

const StyledTag = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '0',
  right: '.4em',
  fontSize: '.65em',
  backgroundColor: theme.palette.warning.main,
  padding: '.3em .2em 2.3em',
  clipPath: 'polygon(0 0,100% 0, 100% 100%, 50% calc(100% - 1.5em), 0 100%)',
  color: theme.palette.grey[50],
  minWidth: '2em',
  fontWeight: '700',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  lineHeight: '1',
}));

const StyledSelector = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '0',
  right: '0',
  width: '100%',
  height: '100%',
  backgroundColor: alpha(theme.palette.success.light, 0.2),

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
}));

const StyledReserveQuantity = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.grey[50], 0.8),
  fontSize: '2rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 15,
  width: '100%',
  gap: '1rem',
  minHeight: '4rem',
}));
