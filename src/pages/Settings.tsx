import { Box, Button, Divider, Typography } from '@mui/material';
import {
  useStore,
  useGetList,
  Title,
  Form,
  NumberInput,
  required,
  useUpdate,
  SaveHandler,
} from 'react-admin';

import { Tables, paperPricesType } from 'types';

export const Settings = () => {
  const [update, { isPending }] = useUpdate<Tables<'settings'>>();

  const [setting, setSetting] = useStore<Tables<'settings'>>('settings');
  const { data: paper_sizes } = useGetList<Tables<'paper_sizes'>>('paper_sizes');

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
        أسعار الورق
      </Typography>
      {paper_sizes?.map((size) => {
        const oldPaperPrices = setting?.paper_prices?.find((price) => price.id === size.id);
        return (
          <Box key={size.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
              <Typography>{size.name}</Typography>
              <NumberInput
                source={`paperPrices.${size.id}.oneFacePrice`}
                label="سعر الوجه الواحد بالقروش"
                helperText={false}
                validate={[required()]}
                defaultValue={oldPaperPrices?.oneFacePrice}
              />
              <NumberInput
                source={`paperPrices.${size.id}.twoFacesPrice`}
                label="سعر الوجهين بالقروش"
                helperText={false}
                validate={[required()]}
                defaultValue={oldPaperPrices?.twoFacesPrice}
              />
            </Box>
            <Divider />
          </Box>
        );
      })}
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
