import { Box, Button, ButtonGroup, Divider, Modal, Typography } from '@mui/material';
import { useState } from 'react';
import {
  Form,
  NumberInput,
  required,
  SaveHandler,
  TextInput,
  useCreate,
  useDelete,
  useGetList,
  useStore,
  useTranslate,
} from 'react-admin';

import { ModalContent, ModalWrapper, NestedModal } from 'components/UI';
import { Tables, TablesInsert } from 'types';

export const PrintingPrices = () => {
  const [setting] = useStore<Tables<'settings'>>('settings');
  const { data: paper_sizes } = useGetList<Tables<'paper_sizes'>>('paper_sizes');
  const [deleteOne] = useDelete<Tables<'paper_sizes'>>();

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
        أسعار الطباعة
      </Typography>
      <Button variant="text" sx={{ fontFamily: 'inherit' }}></Button>
      <CreateModal />

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
              <NestedModal
                title="لا يمكن حذف المقاس إذا كان يستخدم في أي من الموارد"
                buttonText="حذف"
                confirmFn={() => {
                  deleteOne('paper_sizes', { id: size.id });
                }}
              />
            </Box>
            <Divider />
          </Box>
        );
      })}
    </>
  );
};

export const CreateModal = () => {
  const translate = useTranslate();
  const [create] = useCreate<TablesInsert<'paper_sizes'>>();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const addPaperSize: SaveHandler<{ name: string }> = (params) => {
    console.log(params.name);
    return create(
      'paper_sizes',
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
        إضافة مقاس جديد
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
