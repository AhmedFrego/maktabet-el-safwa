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
  ResourceContextProvider,
} from 'react-admin';
import { Save } from '@mui/icons-material';

import { TermInput, YearInput } from 'resources/publications';
import { Tables, PaperPricesType, Enums } from 'types';

import { PrintingPrices, CoversPrices, PhoneNumbersInputs } from '.';

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
    branch_phone_numbers: PhoneNumberPrimitiveShape[];
  }> = (params) => {
    if (!setting?.id) return Promise.reject(new Error('missing setting id'));
    const transformedPapersPrices = toPaperType(
      params.paper_prices ?? {}
    ) as unknown as PaperPricesType[];
    const transformedCoversPrices = toPaperType(
      params.covers_prices ?? {}
    ) as unknown as PaperPricesType[];

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
          branch_phone_numbers: params.branch_phone_numbers,
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
    <ResourceContextProvider value="settings">
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
          <YearInput
            size="small"
            source="current_year"
            label={translate('custom.labels.current_year')}
          />
          <TermInput size="small" source="term" label={translate('custom.labels.current_term')} />
          <TextInput
            sx={{ width: '100%' }}
            source="price_ceil_to"
            size="small"
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
            size="small"
          />
        </Box>
        <PhoneNumbersInputs />

        <Fab
          variant="extended"
          color="info"
          sx={{ bottom: 10, right: 15, fontFamily: 'inherit', position: 'fixed' }}
          type="submit"
        >
          {isPending ? <CircularProgress size={24} sx={{ mr: 1 }} /> : <Save sx={{ mr: 1 }} />}
          {translate('ra.action.save')}
        </Fab>
      </Form>
    </ResourceContextProvider>
  );
};

const toPaperType = (obj: PaperPricesPrimitiveShape): unknown[] =>
  Object.entries(obj).map(([id, values]) => ({ id, ...values }));

interface PaperPricesPrimitiveShape {
  [id: string]: { oneFacePrice: number; twoFacesPrice: number };
}

interface PhoneNumberPrimitiveShape {
  phone_number: string;
  have_whats_app: boolean;
  is_for_calling: boolean;
}
