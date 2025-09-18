import { Link } from 'react-router';

import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

export const Logo = () => {
  return (
    <Link to={'/'}>
      <LogoContainer>
        <Logo1>{'الصفـ' + '\u00A0'.repeat(18) + 'ـوة'}</Logo1>
        <Logo2>كوبي سنتر </Logo2>
      </LogoContainer>
    </Link>
  );
};

const LogoContainer = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
}));

const Logo2 = styled(Typography)(({ theme }) => ({
  color: theme.palette.warning.main,
  fontSize: '1rem',
  position: 'absolute',
  left: '6ch',
}));

const Logo1 = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.light,
}));
