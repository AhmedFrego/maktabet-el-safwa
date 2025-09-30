import { Button } from '@mui/material';
import { useStore, Title, Form, useUpdate, SaveHandler } from 'react-admin';

import { Tables, paperPricesType } from 'types';
import { PrintingPrices } from '.';

export const Settings = () => {
  const [update, { isPending }] = useUpdate<Tables<'settings'>>();

  const [setting, setSetting] = useStore<Tables<'settings'>>('settings');

  const submitHandler: SaveHandler<{ paperPrices: PaperPricesPrimitiveShape }> = (params) => {
    if (!setting?.id) return Promise.reject(new Error('missing setting id'));

    const transformed = toPaperType(params.paperPrices ?? {});
    return update(
      'settings',
      {
        id: setting.id,
        data: { paper_prices: transformed },
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
      <Button variant="contained" type="submit" loading={isPending}>
        ju
      </Button>
    </Form>
  );
};

const toPaperType = (obj: PaperPricesPrimitiveShape): paperPricesType[] =>
  Object.entries(obj).map(([id, values]) => ({ id, ...values }));

interface PaperPricesPrimitiveShape {
  [id: string]: { oneFacePrice: number; twoFacesPrice: number };
}
