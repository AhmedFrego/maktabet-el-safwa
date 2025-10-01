import { Box, Button, ButtonGroup, Chip, Modal, Typography } from '@mui/material';
import { useState } from 'react';
import {
  AutocompleteArrayInput,
  Form,
  Identifier,
  NumberInput,
  required,
  SaveHandler,
  TextInput,
  useCreate,
  useDelete,
  useGetList,
  useStore,
  useTranslate,
  useUpdate,
} from 'react-admin';

import { ModalContent, ModalWrapper, NestedModal } from 'components/UI';
import { Tables, TablesInsert, TablesUpdate } from 'types';

export const CoversPrices = () => {
  const [setting] = useStore<Tables<'settings'>>('settings');
  const { data: cover_paper_types } = useGetList<Tables<'cover_types'>>('cover_types');
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
          borderBottom: `1px solid ${theme.palette.secondary.light}`,
          textAlign: 'center',
          p: 1,
          pb: 2,
        })}
      >
        أسعار التغليف
      </Typography>
      <Button variant="text" sx={{ fontFamily: 'inherit' }}></Button>
      <CreateModal />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {cover_paper_types?.map((type) => {
          const oldPaperPrices = setting?.covers_prices?.find((price) => price.id === type.id);
          const xx = cover_paper_types.find((x) => x.id === type.id);
          console.log(xx);
          return (
            <Box
              key={type.id}
              sx={(theme) => ({ backgroundColor: theme.palette.background.paper, p: 1 })}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                <Typography>{type.name}</Typography>
                <NumberInput
                  source={`covers_prices.${type.id}.oneFacePrice`}
                  label="سعر الوجه الواحد بالقروش"
                  helperText={false}
                  validate={[required()]}
                  defaultValue={oldPaperPrices?.oneFacePrice}
                />
                <NumberInput
                  source={`covers_prices.${type.id}.twoFacesPrice`}
                  label="سعر الوجهين بالقروش"
                  helperText={false}
                  validate={[required()]}
                  defaultValue={oldPaperPrices?.twoFacesPrice}
                />
                <NestedModal
                  title="لا يمكن حذف المقاس إذا كان يستخدم في أي من الموارد"
                  buttonText="حذف"
                  confirmFn={() => {
                    deleteOne('cover_types', { id: type.id });
                  }}
                />
                <Button
                  variant="outlined"
                  sx={{ fontFamily: 'inherit' }}
                  onClick={() => updateAvailability(type.id)}
                  loading={isLoading}
                >
                  {setting?.available_covers?.includes(type.id)
                    ? 'تعيين ك غير متاح'
                    : 'تعيين ك متاح'}
                </Button>
              </Box>
              <Box>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {' '}
                  مناسب لمقاسات :
                  {xx?.to_paper_size?.map((x) => {
                    const p = paper_types?.find((p) => p.id === x);
                    return <Chip key={x} label={p?.name} />;
                  })}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
};

const CreateModal = () => {
  const translate = useTranslate();
  const [create] = useCreate<TablesInsert<'cover_types'>>();
  const { data: paper_types } = useGetList<Tables<'paper_types'>>('paper_types');

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const addPaperSize: SaveHandler<{ name: string; to_paper_size: string[] }> = ({
    name,
    to_paper_size,
  }) => {
    return create(
      'cover_types',
      { data: { name, to_paper_size } },
      {
        onSuccess: () => handleClose(),
        onError: (err) => console.error(err),
      }
    ).then(() => undefined);
  };

  return (
    <Box>
      <Button variant="text" sx={{ fontFamily: 'inherit' }} onClick={handleOpen}>
        إضافة نوع جديد
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <ModalWrapper>
          <ModalContent
            sx={(theme) => ({
              p: 2,
              backgroundColor: theme.palette.grey[100],
            })}
          >
            <Typography>إضافة مقاس جديد</Typography>
            <Form onSubmit={addPaperSize}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <TextInput source="name" label="مقاس الورق" />
                <AutocompleteArrayInput
                  source="to_paper_size"
                  label="مناسب للورق مقاس: "
                  variant="standard"
                  choices={paper_types}
                />
                <ButtonGroup>
                  <Button
                    variant="contained"
                    sx={{ fontFamily: 'inherit' }}
                    onClick={handleClose}
                    color="error"
                  >
                    {translate('ra.action.undo')}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ fontFamily: 'inherit' }}
                    color="success"
                  >
                    {translate('ra.action.create')}
                  </Button>
                </ButtonGroup>
              </Box>
            </Form>
          </ModalContent>
        </ModalWrapper>
      </Modal>
    </Box>
  );
};
