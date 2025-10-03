import { Box, Container, Divider, Grid, Switch, Typography } from '@mui/material';
import { PropsWithChildren, useState } from 'react';
import {
  Show,
  TextField,
  useTranslate,
  BooleanField,
  FunctionField,
  ReferenceField,
  useRecordContext,
  SimpleShowLayout,
} from 'react-admin';

import { useCalcPrice } from 'hooks';
import { DEFAULT_COVER_URL, Tables } from 'types';
import { formatToYYYYMMDD, toArabicNumerals } from 'utils';

export const PublicationShow = () => {
  const translate = useTranslate();

  return (
    <Show>
      <SimpleShowLayout>
        <Grid container spacing={1.5} sx={{ height: '100%' }}>
          <Grid size={6}>
            {translate('resources.publications.fields.id')} :
            <TextField source="id" label={translate('resources.publications.fields.id')} />
            <CoverImageField source="cover_url" defaultSrc={DEFAULT_COVER_URL} />
          </Grid>
          <Grid container size={6} sx={{ flexDirection: 'column' }}>
            <DividedContainer>
              {translate('resources.publications.fields.created_by')} :
              <ReferenceField
                source="created_by"
                reference="users"
                render={({ referenceRecord }: { referenceRecord?: Tables<'users'> }) =>
                  referenceRecord?.full_name
                }
              />
            </DividedContainer>

            <DividedContainer>
              {translate('resources.publications.fields.created_at')} :
              <FunctionField
                source="created_at"
                render={(record) => {
                  const date = new Date(record.created_at);
                  return toArabicNumerals(formatToYYYYMMDD(date.toLocaleDateString('en-GB')));
                }}
              />
            </DividedContainer>
            <DividedContainer>
              {translate('resources.publications.fields.subject_id')} :
              <ReferenceField source="subject_id" reference="subjects" />
            </DividedContainer>

            <DividedContainer>
              {translate('resources.publications.fields.publisher')} :
              <ReferenceField source="publisher" reference="publishers" />
            </DividedContainer>

            <DividedContainer>
              {translate('resources.publications.fields.academic_year')} :
              <ReferenceField source="academic_year" reference="academic_years" />
            </DividedContainer>

            <DividedContainer>
              {translate('resources.publications.fields.term')} :
              <FunctionField
                render={(record) => translate(`resources.publications.labels.term.${record.term}`)}
              />
            </DividedContainer>

            <DividedContainer>
              {translate('resources.publications.fields.year')} :
              <FunctionField source="year" render={(record) => toArabicNumerals(record.year)} />
            </DividedContainer>

            <DividedContainer>
              {translate('resources.publications.fields.pages')} :
              <FunctionField source="pages" render={(record) => toArabicNumerals(record.pages)} />
            </DividedContainer>

            <DividedContainer>
              {translate('resources.publications.fields.default_paper_size')} :
              <ReferenceField source="default_paper_size" reference="paper_types" />
            </DividedContainer>

            <DividedContainer>
              <FunctionField render={(record) => <CustomPriceField record={record} />} />
            </DividedContainer>

            <DividedContainer>
              {translate('resources.publications.fields.do_round')} :
              <BooleanField source="do_round" />
            </DividedContainer>

            <DividedContainer>
              {translate('resources.publications.fields.additional_data')} :
              <TextField source="additional_data" />
            </DividedContainer>

            <DividedContainer>
              {translate('resources.publications.fields.related_publications')} :
              <TextField source="related_publications" />
            </DividedContainer>

            <FunctionField
              label="Name"
              render={(record) => {
                if (record.updated_at && record.updated_by)
                  return (
                    <>
                      <DividedContainer>
                        {translate('resources.publications.fields.updated_by')} :
                        <ReferenceField
                          source="updated_by"
                          reference="users"
                          render={({ referenceRecord }: { referenceRecord?: Tables<'users'> }) =>
                            referenceRecord?.full_name
                          }
                        />
                      </DividedContainer>

                      <DividedContainer>
                        {translate('resources.publications.fields.updated_at')} :
                        <FunctionField
                          source="updated_at"
                          render={(record) => {
                            const date = new Date(record.updated_at);
                            return toArabicNumerals(
                              formatToYYYYMMDD(date.toLocaleDateString('en-GB'))
                            );
                          }}
                        />
                      </DividedContainer>
                    </>
                  );
              }}
            />
          </Grid>
        </Grid>
      </SimpleShowLayout>
    </Show>
  );
};

const CustomPriceField = ({ record }: { record: Tables<'publications'> }) => {
  const { calcPrice } = useCalcPrice();
  const translate = useTranslate();
  const [dublix, setDublix] = useState(true);
  if (!record) return null;

  const { cover, price } = calcPrice({ record });
  return (
    <Box>
      <Typography>{`نوع الغلاف : ${cover?.name || 'لا يوجد مقاس مناسب'}`}</Typography>
      <Typography>
        طباعة على الوجهين :
        <Switch
          value={dublix}
          defaultChecked={dublix}
          onChange={(event) => setDublix(event.target.checked)}
        />
      </Typography>
      <Typography>{`${translate('resources.publications.labels.price')}: ${toArabicNumerals(dublix ? price.twoFacesPrice : price.oneFacePrice)} ${translate('custom.currency.short')}`}</Typography>
    </Box>
  );
};

const CoverImageField = ({ source, defaultSrc }: { source: string; defaultSrc: string }) => {
  const record = useRecordContext();
  const value = record?.[source] || defaultSrc;
  return value ? (
    <img
      src={value}
      alt="cover"
      style={{ width: '100%', height: 'auto', maxHeight: '35em', objectFit: 'contain' }}
    />
  ) : null;
};

const DividedContainer = ({ children }: PropsWithChildren) => (
  <Container>
    {children}
    <Divider />
  </Container>
);
