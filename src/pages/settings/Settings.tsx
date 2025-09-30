import { Box, Button, Typography } from '@mui/material';
import {
  useStore,
  Title,
  Form,
  useUpdate,
  SaveHandler,
  ReferenceInput,
  AutocompleteInput,
  TextInput,
  required,
  choices,
} from 'react-admin';

import { Tables, PaperPricesType, CoverPricesType } from 'types';
import { PrintingPrices, CoversPrices } from '.';

export const Settings = () => {
  const [update, { isPending }] = useUpdate<Tables<'settings'>>();

  const [setting, setSetting] = useStore<Tables<'settings'>>('settings');

  const submitHandler: SaveHandler<{
    paper_prices: PaperPricesPrimitiveShape;
    covers_prices: PaperPricesPrimitiveShape;

    current_term: string;
    current_year: string;
  }> = (params) => {
    if (!setting?.id) return Promise.reject(new Error('missing setting id'));

    const transformedPapersPrices = toPaperType(
      params.paper_prices ?? {}
    ) as unknown as PaperPricesType[];
    const transformedCoversPrices = toPaperType(
      params.covers_prices ?? {}
    ) as unknown as CoverPricesType[];
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

  return (
    <Form onSubmit={submitHandler}>
      <Title title={`إعدادات ${setting?.branch_name}`} />
      <PrintingPrices />
      <CoversPrices />
      <Typography
        variant="h3"
        color="primary"
        sx={(theme) => ({
          borderBottom: `1px solid ${theme.palette.secondary.light}`,
          textAlign: 'center',
          p: 1,
          pb: 2,
        })}
      >
        إعدادات عامة
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <TextInput
          sx={{ width: '100%' }}
          source="current_year"
          label="العام الدراسي"
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
        <ReferenceInput source="current_term" reference="terms">
          <AutocompleteInput
            sx={{ width: '100%' }}
            filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
            defaultValue={setting?.current_term}
            label="الترم الحالي"
          />
        </ReferenceInput>
      </Box>
      <Button variant="contained" type="submit" loading={isPending}>
        ju
      </Button>
    </Form>
  );
};

const toPaperType = (obj: PaperPricesPrimitiveShape): unknown[] =>
  Object.entries(obj).map(([id, values]) => ({ id, ...values }));

interface PaperPricesPrimitiveShape {
  [id: string]: { oneFacePrice: number; twoFacesPrice: number };
}
