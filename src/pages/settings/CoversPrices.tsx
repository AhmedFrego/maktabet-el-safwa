import { Box, Button, ButtonGroup, Divider, Modal, Typography } from '@mui/material';
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

      {cover_paper_types?.map((size, index) => {
        const oldPaperPrices = setting?.covers_prices?.find((price) => price.id === size.id);
        return (
          <Box key={size.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
              <Typography>{size.name}</Typography>
              <NumberInput
                source={`covers_prices.${size.id}.oneFacePrice`}
                label="سعر الوجه الواحد بالقروش"
                helperText={false}
                validate={[required()]}
                defaultValue={oldPaperPrices?.oneFacePrice}
              />
              <NumberInput
                source={`covers_prices.${size.id}.twoFacesPrice`}
                label="سعر الوجهين بالقروش"
                helperText={false}
                validate={[required()]}
                defaultValue={oldPaperPrices?.twoFacesPrice}
              />
              <NestedModal
                title="لا يمكن حذف المقاس إذا كان يستخدم في أي من الموارد"
                buttonText="حذف"
                confirmFn={() => {
                  deleteOne('cover_paper_types', { id: size.id });
                }}
              />
              <Button
                variant="outlined"
                sx={{ fontFamily: 'inherit' }}
                onClick={() => updateAvailability(size.id)}
                loading={isLoading}
              >
                {setting?.available_covers?.includes(size.id) ? 'تعيين ك غير متاح' : 'تعيين ك متاح'}
              </Button>
            </Box>
            <AutocompleteArrayInput
              source={`covers_prices.${size.id}.to_paper_size`}
              label="مناسب للورق مقاس: "
              variant="standard"
              choices={paper_types}
              defaultValue={oldPaperPrices?.to_paper_size}
            />
            {index !== cover_paper_types.length - 1 && <Divider />}
          </Box>
        );
      })}
    </>
  );
};

const CreateModal = () => {
  const translate = useTranslate();
  const [create] = useCreate<TablesInsert<'cover_types'>>();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const addPaperSize: SaveHandler<{ name: string }> = (params) => {
    console.log(params.name);
    return create(
      'cover_types',
      { data: { name: params.name } },
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
