import {
  DateField,
  FunctionField,
  NumberField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  useTranslate,
} from 'react-admin';

import { DividedContainer } from 'components/UI';
import { Tables } from 'types';
import { toArabicNumerals } from 'utils';

export const ReservationShow = () => {
  const translate = useTranslate();
  return (
    <Show title="تفاصيل الحجز">
      <SimpleShowLayout>
        <DividedContainer>
          {translate('resources.reservations.fields.client_id')} :
          <ReferenceField
            source="client_id"
            reference="users"
            render={({ referenceRecord }: { referenceRecord?: Tables<'users'> }) =>
              referenceRecord?.full_name
            }
          />
        </DividedContainer>
        <DividedContainer>
          {translate('resources.reservations.fields.created_at')} :
          <DateField source="created_at" showTime />
        </DividedContainer>
        <DividedContainer>
          {translate('resources.reservations.fields.created_by')}:
          <ReferenceField
            source="created_by"
            reference="users"
            render={({ referenceRecord }: { referenceRecord?: Tables<'users'> }) =>
              ` ${referenceRecord?.full_name}`
            }
          />
        </DividedContainer>
        <DividedContainer>
          {translate('resources.reservations.fields.total_price')}:
          <FunctionField
            source="paid_amount"
            render={(record) =>
              ` ${toArabicNumerals(record.total_price)} ${translate('custom.currency.long')}`
            }
          />
        </DividedContainer>
        <DividedContainer>
          {translate('resources.reservations.fields.paid_amount')}:
          <FunctionField
            source="paid_amount"
            render={(record) =>
              ` ${toArabicNumerals(record.paid_amount)} ${translate('custom.currency.long')}`
            }
          />
        </DividedContainer>
        {/* <ArrayField source="reserved_items">
        <DataTable>
          <DataTable.Col source="id">
            <TextField source="id" />
          </DataTable.Col>
          <DataTable.Col source="term">
            <TextField source="term" />
          </DataTable.Col>
          <DataTable.Col source="year">
            <DateField source="year" />
          </DataTable.Col>
          <DataTable.Col source="pages">
            <NumberField source="pages" />
          </DataTable.Col>
          <DataTable.Col source="price">
            <NumberField source="price" />
          </DataTable.Col>
          <DataTable.Col source="title">
            <TextField source="title" />
          </DataTable.Col>
          <DataTable.Col source="status">
            <TextField source="status" />
          </DataTable.Col>
          <DataTable.Col source="subject.name">
            <TextField source="subject.name" />
          </DataTable.Col>
          <DataTable.Col source="do_round">
            <BooleanField source="do_round" />
          </DataTable.Col>
          <DataTable.Col source="isDublix">
            <BooleanField source="isDublix" />
          </DataTable.Col>
          <DataTable.Col source="quantity">
            <NumberField source="quantity" />
          </DataTable.Col>
          <DataTable.Col source="cover_url">
            <TextField source="cover_url" />
          </DataTable.Col>
          <DataTable.Col source="publisher.name">
            <TextField source="publisher.name" />
          </DataTable.Col>
          <DataTable.Col source="cover_type.name">
            <TextField source="cover_type.name" />
          </DataTable.Col>
          <DataTable.Col source="created_at">
            <DateField source="created_at" />
          </DataTable.Col>
          <DataTable.Col source="created_by">
            <TextField source="created_by" />
          </DataTable.Col>
          <DataTable.Col source="paper_type.name">
            <TextField source="paper_type.name" />
          </DataTable.Col>
          <DataTable.Col source="subject_id">
            <ReferenceField source="subject_id" reference="subjects" />
          </DataTable.Col>
          <DataTable.Col source="totalPrice">
            <NumberField source="totalPrice" />
          </DataTable.Col>
          <DataTable.Col source="updated_at">
            <DateField source="updated_at" />
          </DataTable.Col>
          <DataTable.Col source="updated_by">
            <TextField source="updated_by" />
          </DataTable.Col>
          <DataTable.Col source="deliveredAt">
            <DateField source="deliveredAt" />
          </DataTable.Col>
          <DataTable.Col source="deliveredBy">
            <TextField source="deliveredBy" />
          </DataTable.Col>
          <DataTable.Col source="change_price">
            <TextField source="change_price" />
          </DataTable.Col>
          <DataTable.Col source="publisher_id">
            <ReferenceField source="publisher_id" reference="publishers" />
          </DataTable.Col>
          <DataTable.Col source="academic_year">
            <TextField source="academic_year" />
          </DataTable.Col>
          <DataTable.Col source="cover_type_id">
            <ReferenceField source="cover_type_id" reference="cover_types" />
          </DataTable.Col>
          <DataTable.Col source="paper_type_id">
            <ReferenceField source="paper_type_id" reference="paper_types" />
          </DataTable.Col>
          <DataTable.Col source="additional_data">
            <TextField source="additional_data" />
          </DataTable.Col>
          <DataTable.Col source="two_faces_cover">
            <BooleanField source="two_faces_cover" />
          </DataTable.Col>
          <DataTable.Col source="publication_type">
            <TextField source="publication_type" />
          </DataTable.Col>
          <DataTable.Col source="related_publications">
            <TextField source="related_publications" />
          </DataTable.Col>
        </DataTable>
      </ArrayField> */}

        <TextField source="reservation_status" />
        <NumberField source="remain_amount" />
        <DateField source="dead_line" />
        <TextField source="delivered_at" />
        <TextField source="delivered_by" />
        <TextField source="branch" />
      </SimpleShowLayout>
    </Show>
  );
};
