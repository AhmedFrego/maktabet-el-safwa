import { Container, Divider, Grid } from '@mui/material';
import {
  BooleanField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  ImageField,
  useTranslate,
  FunctionField,
  useGetList,
} from 'react-admin';

import { Tables } from 'types';
import { calcRecordPrice, formatToYYYYMMDD, toArabicNumerals } from 'utils/helpers';

export const NoteShow = () => {
  const translate = useTranslate();
  const { data: settings } = useGetList<Tables<'settings'>>('settings', {
    meta: { columns: ['*'] },
  });

  return (
    <Show>
      <SimpleShowLayout>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          <Grid size={6}>
            {translate('resources.notes.fields.id')} :
            <TextField source="id" label={translate('resources.notes.fields.id')} />
            <ImageField
              source="cover_url"
              sx={{
                '& .RaImageField-image': {
                  width: '100%',
                  height: 'auto',
                  maxHeight: '35em',
                  objectFit: 'contain',
                },
              }}
            />
          </Grid>
          <Grid container size={6} sx={{ flexDirection: 'column' }}>
            <Container>
              {translate('resources.notes.fields.subject_id')} :
              <ReferenceField source="subject_id" reference="subjects" />
              <TextField source="nickname" />
              <Divider />
            </Container>
            <Container>
              {translate('resources.notes.fields.teacher_id')} :
              <ReferenceField source="teacher_id" reference="teachers" />
              <Divider />
            </Container>
            <Container>
              {translate('resources.notes.fields.academic_year')} :
              <ReferenceField source="academic_year" reference="academic_years" /> <Divider />
            </Container>
            <Container>
              {translate('resources.notes.fields.term_id')} :
              <ReferenceField source="term_id" reference="terms" />
              <Divider />
            </Container>

            <Container>
              {translate('resources.notes.fields.year')} :
              <FunctionField source="year" render={(record) => toArabicNumerals(record.year)} />
              <Divider />
            </Container>
            <Container>
              {translate('resources.notes.fields.pages')} :
              <FunctionField source="pages" render={(record) => toArabicNumerals(record.pages)} />
              <Divider />
            </Container>

            <Container>
              {translate('resources.notes.fields.default_paper_size')} :
              <ReferenceField source="default_paper_size" reference="paper_sizes" />
              <Divider />
            </Container>

            <Container>
              {translate('resources.notes.fields.price')} :
              <FunctionField
                source="created_at"
                render={(record) => {
                  if (record.price) return toArabicNumerals(record.price);
                  else
                    return toArabicNumerals(
                      '( محسوب تلقائياً ) ' +
                        calcRecordPrice({
                          record,
                          paperPrices: settings?.[0].paper_prices,
                          roundTo: settings?.[0].price_ceil_to,
                        }) || 0
                    );
                }}
              />
              {translate('custom.currency.long')} <Divider />
            </Container>

            <Container>
              {translate('resources.notes.fields.created_at')} :
              <FunctionField
                source="created_at"
                render={(record) => {
                  const date = new Date(record.created_at);
                  return toArabicNumerals(formatToYYYYMMDD(date.toLocaleDateString('en-GB')));
                }}
              />
              <Divider />
            </Container>

            <Container>
              {translate('resources.notes.fields.created_by')} :
              <ReferenceField
                source="created_by"
                reference="users"
                render={({ referenceRecord }: { referenceRecord: Tables<'users'> }) => {
                  return <>{referenceRecord.full_name}</>;
                }}
              />
              <Divider />
            </Container>

            <Container>
              {translate('resources.notes.fields.updated_at')} :
              <FunctionField
                source="updated_at"
                render={(record) => {
                  if (record.updated_at) {
                    const date = new Date(record.updated_at);
                    return toArabicNumerals(formatToYYYYMMDD(date.toLocaleDateString('en-GB')));
                  } else return '--/--/----';
                }}
              />
              <Divider />
            </Container>

            <Container>
              {translate('resources.notes.fields.updated_by')} :
              <ReferenceField
                source="updated_by"
                reference="users"
                render={({ referenceRecord }: { referenceRecord: Tables<'users'> }) => {
                  console.log(referenceRecord);
                  return <>{referenceRecord.full_name || '0000000000'}</>;
                }}
              />
              <Divider />
            </Container>

            <TextField source="additional_data" />
            <TextField source="related_notes" />
            <BooleanField source="do_round" />
          </Grid>
        </Grid>
      </SimpleShowLayout>
    </Show>
  );
};
