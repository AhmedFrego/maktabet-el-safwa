import { Box, Button, Typography } from '@mui/material';
import {
  useStore,
  Title,
  Form,
  useUpdate,
  SaveHandler,
  AutocompleteInput,
  TextInput,
  required,
  choices,
  useTranslate,
  number,
} from 'react-admin';

import { Tables, PaperPricesType, Enums } from 'types';
import { PrintingPrices, CoversPrices } from '.';

export const Settings = () => {
  const translate = useTranslate();
  const [update, { isPending }] = useUpdate<Tables<'settings'>>();

  const [setting, setSetting] = useStore<Tables<'settings'>>('settings');

  const submitHandler: SaveHandler<{
    paper_prices: PaperPricesPrimitiveShape;
    covers_prices: PaperPricesPrimitiveShape;

    current_term: Enums<'term'>;
    current_year: string;
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
        },
        previousData: setting,
      },
      {
        onSuccess: (data) => setSetting(data),
        onError: (err) => console.error(err),
      }
    ).then(() => undefined);
  };

  const termsOptions = [
    { id: '1st', name: translate('resources.publications.labels.term.1st') },
    { id: '2nd', name: translate('resources.publications.labels.term.2nd') },
    { id: 'full_year', name: translate('resources.publications.labels.term.full_year') },
  ] as {
    id: Enums<'term'>;
    name: string;
  }[];

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
        <TextInput
          sx={{ width: '100%' }}
          source="current_year"
          label={translate('custom.labels.current_year')}
          defaultValue={setting?.current_year}
          validate={[
            required(),
            choices([
              `${new Date().getFullYear() + 1}`,
              `${new Date().getFullYear()}`,
              `${new Date().getFullYear() - 1}`,
            ]),
          ]}
        />
        <AutocompleteInput
          fullWidth
          source="term"
          filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
          choices={termsOptions}
          defaultValue={setting?.current_term}
          label={translate('custom.labels.current_term')}
        />
        <TextInput
          sx={{ width: '100%' }}
          source="price_ceil_to"
          label={translate('custom.labels.price_ceil_to')}
          defaultValue={+(setting?.price_ceil_to || 0)}
          validate={[required(), number()]}
        />
      </Box>
      <Button variant="contained" type="submit" loading={isPending} sx={{ fontFamily: 'inherit' }}>
        {translate('ra.action.save')}
      </Button>
    </Form>
  );
};

const toPaperType = (obj: PaperPricesPrimitiveShape): unknown[] =>
  Object.entries(obj).map(([id, values]) => ({ id, ...values }));

interface PaperPricesPrimitiveShape {
  [id: string]: { oneFacePrice: number; twoFacesPrice: number };
}
