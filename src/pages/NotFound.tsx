import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Title, useTranslate } from 'react-admin';

export const NotFound = () => {
  const translate = useTranslate();
  return (
    <Card>
      <Title title={translate('custom.not_found.title')} />
      <CardContent>
        <h1>{translate('custom.not_found.message')}</h1>
      </CardContent>
    </Card>
  );
};
