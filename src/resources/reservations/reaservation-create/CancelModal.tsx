import { useState } from 'react';
import { Box, Modal, Typography } from '@mui/material';
import { Button, useTranslate } from 'react-admin';

import { ModalContent, ModalWrapper } from 'components/UI/Modal';
import { clearItems, useAppDispatch } from 'store';

export const CancelModal = () => {
  const translate = useTranslate();
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button variant="outlined" sx={{ fontFamily: 'inherit' }} onClick={handleOpen} color="error">
        {translate('ra.action.cancel')}
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <ModalWrapper>
          <ModalContent sx={{ backgroundColor: 'red' }}>
            <Typography>انت على وشك</Typography>
            <Box sx={{ display: 'flex', gap: '1rem' }}>
              <Button
                variant="contained"
                sx={{ fontFamily: 'inherit' }}
                onClick={handleClose}
                color="primary"
              >
                {translate('ra.action.undo')}
              </Button>
              <Button
                variant="contained"
                color="error"
                sx={{ fontFamily: 'inherit' }}
                onClick={() => dispatch(clearItems())}
              >
                {translate('ra.action.confirm')}
              </Button>
            </Box>
          </ModalContent>
        </ModalWrapper>
      </Modal>
    </div>
  );
};
