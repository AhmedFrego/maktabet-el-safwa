import { alpha, Card, CardContent, Chip } from '@mui/material';
import { Box, styled } from '@mui/system';

export const StyledCard = styled(Card)(({ theme }) => ({
  padding: 3,
  borderTopLeftRadius: 20,
  borderBottomRightRadius: 20,
  backgroundColor: theme.palette.grey[100],
  flexBasis: 150,
  cursor: 'pointer',
  position: 'relative',
}));

export const StyledCardContent = styled(CardContent)({
  position: 'relative',
  borderTopLeftRadius: 20,
  overflow: 'hidden',
  transition: 'transform 160ms ease, box-shadow 160ms ease',
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  padding: 0,
  alignItems: 'center',
  transform: 'scale(1.05)',
  '&.MuiCardContent-root': {
    paddingBottom: 3,
  },
  '&:hover': {
    transform: 'scale(1)',
  },
});

export const CoverImage = styled('img')({
  width: '100%',
  height: '13em',
  objectFit: 'cover',
});

export const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.secondary,
  top: 3,
  left: 3,
  position: 'absolute',
  fontWeight: '900',
  fontSize: 10,
}));

export const StyledTag = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 6,
  fontSize: 11,
  backgroundColor: theme.palette.warning.main,
  padding: '.3em .2em 2.3em',
  clipPath: 'polygon(0 0,100% 0, 100% 100%, 50% calc(100% - 1.5em), 0 100%)',
  color: theme.palette.grey[50],
  minWidth: 25,
  fontWeight: '700',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  lineHeight: '1',
}));

export const StyledSelector = styled(Box)(({ theme }) => ({
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

export const StyledReserveQuantity = styled(Box)(({ theme }) => ({
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
