import { Box, Button, Modal, Typography } from '@mui/material';
import { useState } from 'react';
import {
  AutocompleteArrayInput,
  Form,
  SaveHandler,
  TextInput,
  useCreate,
  useGetList,
  useTranslate,
  required,
  useUpdate,
  Identifier,
} from 'react-admin';

import { ModalContent, ModalWrapper } from 'components/UI';
import { Tables, TablesInsert, TablesUpdate } from 'types';

export const CoverModalForm = ({ cover_type }: CoverModalFormProps) => {
  const translate = useTranslate();
  const [create] = useCreate<TablesInsert<'cover_types'>>();
  const [update] = useUpdate<Omit<TablesUpdate<'cover_types'>, 'id'> & { id: Identifier }>();

  const { data: paper_types } = useGetList<Tables<'paper_types'>>('paper_types');

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const coverTypeHandler: SaveHandler<
    TablesInsert<'cover_types'> | (Omit<TablesUpdate<'cover_types'>, 'id'> & { id: Identifier })
  > = ({ name, to_paper_size }) => {
    const data = { name, to_paper_size };
    if (cover_type)
      return update(
        'cover_types',
        { id: cover_type.id, data, previousData: cover_type },
        {
          onSuccess: () => handleClose(),
          onError: (err) => console.error(err),
        }
      );
    else
      return create(
        'cover_types',
        { data },
        {
          onSuccess: () => handleClose(),
          onError: (err) => console.error(err),
        }
      );
  };

  return (
    <Box>
      <Button variant="text" sx={{ fontFamily: 'inherit' }} onClick={handleOpen}>
        {translate(`resources.cover_types.actions.${cover_type ? 'edit' : 'create'}`)}
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
            <Typography>{translate('resources.cover_types.labels.details')}</Typography>
            <Form onSubmit={coverTypeHandler} defaultValues={cover_type}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <TextInput
                  source="name"
                  label={translate('resources.cover_types.fields.name')}
                  validate={required()}
                />
                <AutocompleteArrayInput
                  source="to_paper_size"
                  label={translate('resources.cover_types.fields.to_paper_size')}
                  variant="standard"
                  choices={paper_types}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    sx={{ fontFamily: 'inherit' }}
                    onClick={handleClose}
                    color="error"
                  >
                    {translate('ra.action.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="outlined"
                    sx={{ fontFamily: 'inherit' }}
                    color="success"
                  >
                    {translate(`ra.action.${cover_type ? 'edit' : 'create'}`)}
                  </Button>
                </Box>
              </Box>
            </Form>
          </ModalContent>
        </ModalWrapper>
      </Modal>
    </Box>
  );
};

interface CoverModalFormProps {
  cover_type?: Tables<'cover_types'>;
}
