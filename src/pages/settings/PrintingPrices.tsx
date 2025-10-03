import { Box, Button, ButtonGroup, Modal, Typography } from '@mui/material';
import { useState } from 'react';
import {
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

import { ModalContent, ModalWrapper, NestedModal, PaperBox } from 'components/UI';
import { Tables, TablesInsert, TablesUpdate } from 'types';

export const PrintingPrices = () => {
  const [setting] = useStore<Tables<'settings'>>('settings');
  const { data: paper_types } = useGetList<Tables<'paper_types'>>('paper_types');
  const [deleteOne] = useDelete<Tables<'paper_types'>>();
  const [update] = useUpdate<Omit<TablesUpdate<'settings'>, 'id'> & { id: Identifier }>();

  const updateDefaultPaper = (id: string) => {
    update('settings', {
      previousData: setting,
      id: setting?.id,
      data: { default_paper_size: id },
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
        })}
      >
        أسعار الطباعة
      </Typography>
      <CreateModal />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {paper_types?.map((size) => {
          const oldPaperPrices = setting?.paper_prices?.find((price) => price.id === size.id);
          return (
            <PaperBox key={size.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 1 }}>
                <Typography>{size.name}</Typography>
                <NumberInput
                  source={`paper_prices.${size.id}.oneFacePrice`}
                  label="سعر الوجه الواحد بالقروش"
                  helperText={false}
                  validate={[required()]}
                  defaultValue={oldPaperPrices?.oneFacePrice}
                />
                <NumberInput
                  source={`paper_prices.${size.id}.twoFacesPrice`}
                  label="سعر الوجهين بالقروش"
                  helperText={false}
                  validate={[required()]}
                  defaultValue={oldPaperPrices?.twoFacesPrice}
                />
                <NestedModal
                  title="لا يمكن حذف المقاس إذا كان يستخدم في أي من الموارد"
                  buttonText="حذف"
                  confirmFn={() => {
                    deleteOne('paper_types', { id: size.id });
                  }}
                />
                {setting?.default_paper_size !== size.id && (
                  <Button
                    variant="outlined"
                    sx={{ fontFamily: 'inherit' }}
                    onClick={() => updateDefaultPaper(size.id)}
                  >
                    تعيين كإفتراضي
                  </Button>
                )}
              </Box>
            </PaperBox>
          );
        })}
      </Box>
    </>
  );
};

const CreateModal = () => {
  const translate = useTranslate();
  const [create] = useCreate<TablesInsert<'paper_types'>>();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const addPaperSize: SaveHandler<{ name: string }> = (params) => {
    return create(
      'paper_types',
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
