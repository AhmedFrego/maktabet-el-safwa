import React, { useEffect, useRef, useState } from 'react';
import { ModalContent, ModalWrapper } from 'components/UI';
import { ButtonGroup, Modal, Typography } from '@mui/material';
import {
  AutocompleteInput,
  Button,
  CreateBase,
  Identifier,
  RaRecord,
  ReferenceInput,
  required,
  SimpleForm,
  TextInput,
  useTranslate,
  regex,
} from 'react-admin';

export const ClientInput = () => {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
  const [initialFullName, setInitialFullName] = useState<string>('');

  const resolverRef = useRef<null | ((createdChoice: unknown) => void)>(null);

  const handleOnCreate = (typedValue?: string) => {
    setInitialFullName(typedValue || '');
    setOpen(true);

    return new Promise((resolve) => (resolverRef.current = resolve));
  };

  const handleCancel = () => {
    setOpen(false);
    if (resolverRef.current) {
      resolverRef.current(undefined);
      resolverRef.current = null;
    }
  };

  const handleCreated = (createdRecord: unknown) => {
    setOpen(false);
    if (resolverRef.current) {
      resolverRef.current(createdRecord);
      resolverRef.current = null;
    }
  };

  return (
    <>
      <ReferenceInput
        source="client_id"
        reference="users"
        sort={{ field: 'created_at', order: 'DESC' }}
      >
        <AutocompleteInput
          validate={required()}
          sx={{ width: '100%' }}
          variant="standard"
          label={translate('custom.labels.client')}
          optionText={(record) => (record ? `${record.full_name} (${record.phone_number})` : '')}
          filterToQuery={(searchText) => {
            if (!searchText) return {};
            const q = `%${searchText.trim()}%`;
            return { or: `(full_name.ilike.${q},phone_number.ilike.${q})` };
          }}
          helperText={false}
          onCreate={handleOnCreate}
        />
      </ReferenceInput>

      {open && (
        <CreateClientModal
          initialFullName={initialFullName}
          onCancel={handleCancel}
          onCreated={handleCreated}
        />
      )}
    </>
  );
};

type CreateClientModalProps = {
  initialFullName: string;
  onCancel: () => void;
  onCreated: (createdRecord: unknown) => void;
};

const CreateClientModal: React.FC<CreateClientModalProps> = ({
  initialFullName,
  onCancel,
  onCreated,
}) => {
  const translate = useTranslate();

  useEffect(() => {
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
  }, []);

  return (
    <Modal open onClose={onCancel} aria-labelledby="create-client-modal">
      <ModalWrapper>
        <ModalContent
          sx={(theme) => ({
            backgroundColor: theme.palette.grey[100],
            maxWidth: 280,
            width: '90%',
          })}
        >
          <Typography
            variant="h6"
            sx={(theme) => ({
              fontFamily: 'inherit',
              fontWeight: 800,
              textAlign: 'center',
              mb: 3,
              pb: 1.5,
              mt: 1,
              color: theme.palette.secondary.main,
              borderBottom: `3px solid ${theme.palette.secondary.main}`,
              fontSize: '1.25rem',
            })}
          >
            {translate('resources.users.actions.create')}
          </Typography>
          <CreateBase
            redirect={false}
            resource="users"
            mutationOptions={{
              onSuccess: (response: RaRecord<Identifier>) => {
                const created = response?.data ?? response;
                onCreated(created);
              },
            }}
          >
            <SimpleForm
              defaultValues={{ full_name: initialFullName }}
              toolbar={
                <ButtonGroup
                  variant="contained"
                  sx={(theme) => ({ m: 2, fontFamily: theme.typography.fontFamily })}
                >
                  <Button
                    color="error"
                    onClick={onCancel}
                    sx={(theme) => ({
                      px: 2,
                      fontFamily: theme.typography.fontFamily,
                      fontSize: 17,
                    })}
                  >
                    {translate('ra.action.cancel')}
                  </Button>
                  <Button
                    color="success"
                    type="submit"
                    sx={(theme) => ({
                      px: 2,
                      fontFamily: theme.typography.fontFamily,
                      fontSize: 17,
                    })}
                  >
                    {translate('ra.action.confirm')}
                  </Button>
                </ButtonGroup>
              }
            >
              <TextInput
                source="full_name"
                helperText={false}
                validate={required()}
                variant="standard"
                fullWidth
              />
              <TextInput
                isRequired={false}
                source="phone_number"
                helperText={false}
                validate={[regex(/^01[0125]\d{8}$/, 'لا يبدو كرقم هاتف صحيح')]}
                variant="standard"
                fullWidth
              />
            </SimpleForm>
          </CreateBase>
        </ModalContent>
      </ModalWrapper>
    </Modal>
  );
};
