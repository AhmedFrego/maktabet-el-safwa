import { Box, Button, Chip, Typography } from '@mui/material';
import {
  Identifier,
  number,
  required,
  TextInput,
  useDelete,
  useGetList,
  useStore,
  useUpdate,
} from 'react-admin';

import { NestedModal, PaperBox } from 'components/UI';
import { Tables, TablesUpdate } from 'types';

import { CoverModalForm } from '.';

export const CoversPrices = () => {
  const [setting] = useStore<Tables<'settings'>>('settings');
  const { data: cover_types } = useGetList<Tables<'cover_types'>>('cover_types');
  const { data: paper_types } = useGetList<Tables<'paper_types'>>('paper_types');

  const [deleteOne] = useDelete<Tables<'cover_types'>>();
  const [update, { isLoading }] = useUpdate<
    Omit<TablesUpdate<'settings'>, 'id'> & { id: Identifier }
  >();

  const updateAvailability = (id: string) => {
    const availableCovers = setting?.available_covers ?? [];
    const data = availableCovers.includes(id)
      ? availableCovers.filter((x) => x !== id)
      : [...availableCovers, id];
    update('settings', {
      id: setting?.id,
      previousData: setting,
      data: {
        available_covers: data,
      },
    });
  };

  return (
    <>
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
        أسعار التغليف
      </Typography>
      <CoverModalForm />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {cover_types?.map((cover_type) => {
          const oldPaperPrices = setting?.covers_prices?.find(
            (price) => price.id === cover_type.id
          );

          return (
            <PaperBox key={cover_type.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                <Typography>{cover_type.name}</Typography>
                <TextInput
                  source={`covers_prices.${cover_type.id}.oneFacePrice`}
                  label="سعر الوجه الواحد بالجنيه"
                  helperText={false}
                  validate={[required(), number()]}
                  defaultValue={oldPaperPrices?.oneFacePrice}
                  size="small"
                />
                <TextInput
                  source={`covers_prices.${cover_type.id}.twoFacesPrice`}
                  label="سعر الوجهين بالجنيه"
                  helperText={false}
                  validate={[required(), number()]}
                  defaultValue={oldPaperPrices?.twoFacesPrice}
                  size="small"
                />
                <NestedModal
                  title="لا يمكن حذف المقاس إذا كان يستخدم في أي من الموارد"
                  buttonText="حذف"
                  confirmFn={() => {
                    deleteOne('cover_types', { id: cover_type.id });
                  }}
                />
                <Button
                  variant="outlined"
                  sx={{ fontFamily: 'inherit' }}
                  onClick={() => updateAvailability(cover_type.id)}
                  loading={isLoading}
                >
                  {setting?.available_covers?.includes(cover_type.id)
                    ? 'تعيين ك غير متاح'
                    : 'تعيين ك متاح'}
                </Button>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                مناسب لمقاسات :
                {cover_type?.to_paper_size?.map((x) => {
                  const paper_type = paper_types?.find((p) => p.id === x);
                  return <Chip key={x} label={paper_type?.name} />;
                })}
                <CoverModalForm cover_type={cover_type} />
              </Box>
            </PaperBox>
          );
        })}
      </Box>
    </>
  );
};
