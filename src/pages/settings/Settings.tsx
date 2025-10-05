import { Box, CircularProgress, Fab, Typography } from '@mui/material';
import {
  useStore,
  Title,
  Form,
  useUpdate,
  SaveHandler,
  TextInput,
  required,
  useTranslate,
  number,
  useRedirect,
} from 'react-admin';

import { Tables, PaperPricesType, Enums } from 'types';
import { PrintingPrices, CoversPrices } from '.';
import { TermInput, YearInput } from 'resources/publications';
import { Save } from '@mui/icons-material';

export const Settings = () => {
  const translate = useTranslate();
  const [update, { isPending }] = useUpdate<Tables<'settings'>>();
  const redirect = useRedirect();

  const [setting, setSetting] = useStore<Tables<'settings'>>('settings');

  const submitHandler: SaveHandler<{
    paper_prices: PaperPricesPrimitiveShape;
    covers_prices: PaperPricesPrimitiveShape;
    current_term: Enums<'term'>;
    current_year: string;
    price_ceil_to: string;
    deliver_after: string;
  }> = (params) => {
    if (!setting?.id) return Promise.reject(new Error('missing setting id'));
    const transformedPapersPrices = toPaperType(
      params.paper_prices ?? {}
    ) as unknown as PaperPricesType[];
    const transformedCoversPrices = toPaperType(
      params.covers_prices ?? {}
    ) as unknown as PaperPricesType[];
    console.log(params.price_ceil_to);
    return update(
      'settings',
      {
        id: setting.id,
        data: {
          paper_prices: transformedPapersPrices,
          current_term: params.current_term,
          current_year: params.current_year,
          covers_prices: transformedCoversPrices,
          price_ceil_to: Number(params.price_ceil_to),
          deliver_after: Number(params.deliver_after),
        },
        previousData: setting,
      },
      {
        onSuccess: (data) => {
          setSetting(data);
          redirect('/');
        },
        onError: (err) => console.error(err),
      }
    ).then(() => undefined);
  };

  return (
    <Form onSubmit={submitHandler}>
      <Title title={`إعدادات ${setting?.branch_name}`} />
      <PrintingPrices />
      <CoversPrices />

      <Typography
        variant="h3"
        color="primary"
        sx={(theme) => ({
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.primary.contrastText,
          textAlign: 'center',
          p: 1,
          mt: 2,
        })}
      >
        إعدادات عامة
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <YearInput source="current_year" label={translate('custom.labels.current_year')} />
        <TermInput source="term" label={translate('custom.labels.current_term')} />
        <TextInput
          sx={{ width: '100%' }}
          source="price_ceil_to"
          label={translate('custom.labels.price_ceil_to')}
          defaultValue={+(setting?.price_ceil_to || 0)}
          validate={[required(), number()]}
        />
        <TextInput
          sx={{ width: '100%' }}
          source="deliver_after"
          label={translate('custom.labels.deliver_after')}
          defaultValue={+(setting?.deliver_after || 0)}
          validate={[required(), number()]}
        />
      </Box>

      <Fab
        variant="extended"
        color="info"
        sx={{ bottom: 10, left: 1000, fontFamily: 'inherit', position: 'sticky' }}
        type="submit"
      >
        {isPending ? <CircularProgress size={24} sx={{ mr: 1 }} /> : <Save sx={{ mr: 1 }} />}
        {translate('ra.action.save')}
      </Fab>
    </Form>
  );
};

const toPaperType = (obj: PaperPricesPrimitiveShape): unknown[] =>
  Object.entries(obj).map(([id, values]) => ({ id, ...values }));

interface PaperPricesPrimitiveShape {
  [id: string]: { oneFacePrice: number; twoFacesPrice: number };
}
