import { Box, Button, Chip, Typography } from '@mui/material';
import {
  Identifier,
  number,
  required,
  TextInput,
  useDelete,
  useGetList,
  useStore,
  useTranslate,
  useUpdate,
} from 'react-admin';

import { NestedModal, PaperBox } from 'components/UI';
import { Tables, TablesUpdate } from 'types';

import { CoverModalForm } from '.';

export const CoversPrices = () => {
  const translate = useTranslate();
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
        {translate('custom.settings.covers_prices')}
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
                  label={translate('custom.labels.one_face_price_pounds')}
                  helperText={false}
                  validate={[required(), number()]}
                  defaultValue={oldPaperPrices?.oneFacePrice}
                  size="small"
                />
                <TextInput
                  source={`covers_prices.${cover_type.id}.twoFacesPrice`}
                  label={translate('custom.labels.two_faces_price_pounds')}
                  helperText={false}
                  validate={[required(), number()]}
                  defaultValue={oldPaperPrices?.twoFacesPrice}
                  size="small"
                />
                <NestedModal
                  title={translate('custom.settings.cannot_delete_used')}
                  buttonText={translate('ra.action.delete')}
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
                    ? translate('custom.labels.set_as_unavailable')
                    : translate('custom.labels.set_as_available')}
                </Button>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {translate('custom.labels.suitable_for')} :
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
