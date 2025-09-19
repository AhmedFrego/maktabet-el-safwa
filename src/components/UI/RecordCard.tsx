import { styled } from '@mui/material/styles';
import { CardContent, Chip, Typography, Card } from '@mui/material';

import { DEFAULT_COVER_URL } from 'types';

export const RecordCard = ({ record }: RecordCardProps) => {
  const { bottomText, coverUrl, chipText, tagText } = record;

  return (
    <StyledCard>
      <StyledCardContent>
        {chipText && <StyledChip label={chipText} />}
        {tagText && <StyledTag>{tagText}</StyledTag>}
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

interface RecordCardProps {
  record: recordCardStructure;
}

export interface recordCardStructure {
  coverUrl: string | null;
  chipText?: string;
  tagText?: string | number;
  bottomText: {
    start: string;
    end: string;
  };
}

const StyledCard = styled(Card)(({ theme }) => ({
  padding: '.3em',
  borderTopLeftRadius: theme.spacing(4),
  backgroundColor: theme.palette.grey[100],
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  position: 'relative',
  borderTopLeftRadius: theme.spacing(4),
  overflow: 'hidden',
  transition: 'transform 160ms ease, box-shadow 160ms ease',
  padding: '0',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  alignItems: 'center',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const CoverImage = styled('img')(() => ({
  width: '100%',
  height: '11em',
  objectFit: 'cover',
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.secondary,
  top: '.5em',
  left: '.5em',
  position: 'absolute',
  fontWeight: '900',
  fontSize: '.5em',
}));

const StyledTag = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '0',
  right: '.4em',
  fontSize: '.55em',
  backgroundColor: theme.palette.warning.main,
  padding: '.3em .2em 1.8em',
  clipPath: 'polygon(0 0,100% 0, 100% 100%, 50% 55%, 0 100%)',
  color: theme.palette.grey[50],
  minWidth: '2em',
  fontWeight: '700',
  textAlign: 'center',
}));
