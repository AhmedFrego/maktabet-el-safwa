import { useState } from 'react';
import { Box, Modal, Typography } from '@mui/material';
import { Button, useTranslate } from 'react-admin';

import { ModalContent, ModalWrapper } from 'components/UI/Modal';

export const NestedModal = ({
  buttonText,
  confirmFn,
  title,
  color = 'error',
  buttonSize = 'medium',
}: NestedModalProps) => {
  const translate = useTranslate();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box>
      <Button
        variant="outlined"
        size={buttonSize}
        sx={{ fontFamily: 'inherit' }}
        onClick={handleOpen}
        color={color}
      >
        {buttonText || translate('ra.action.cancel')}
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
              border: `2px solid ${theme.palette[color].main}`,
            })}
          >
            <Typography>{title}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
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
                onClick={() => confirmFn()}
              >
                {translate('ra.action.cancel')}
              </Button>
            </Box>
          </ModalContent>
        </ModalWrapper>
      </Modal>
    </Box>
  );
};

interface NestedModalProps {
  buttonText?: string;
  confirmFn: () => void;
  title: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  buttonSize?: 'small' | 'medium' | 'large';
}
