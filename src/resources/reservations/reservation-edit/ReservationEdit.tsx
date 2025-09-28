import {
  ArrayInput,
  DateInput,
  Edit,
  FormDataConsumer,
  NumberInput,
  SimpleForm,
  SimpleFormIterator,
  TextInput,
  useEditContext,
} from 'react-admin';
import { Divider } from '@mui/material';

import { ReservationRecord } from 'store';
import { ClientInput } from 'components/form';

import { ReservedItem } from '../components';

export const ReservationEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <ClientInput />
        <EditForm /> <TextInput source="reservation_status" />
        <NumberInput source="total_price" />
        <NumberInput source="paid_amount" />
        <NumberInput source="remain_amount" />
        <DateInput source="dead_line" />
      </SimpleForm>
    </Edit>
  );
};

const EditForm = () => {
  const { record } = useEditContext();
  console.log(record);
  return (
    <>
      <ArrayInput source="reserved_items">
        <SimpleFormIterator>
          <FormDataConsumer>
            {({ scopedFormData }) => (
              <>
                {scopedFormData && (
                  <ReservedItem item={scopedFormData as ReservationRecord<unknown>} />
                )}
              </>
            )}
          </FormDataConsumer>
        </SimpleFormIterator>
      </ArrayInput>

      <Divider />
    </>
  );
};
