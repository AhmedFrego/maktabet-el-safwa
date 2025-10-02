import { Box, Container, Divider, Grid, Switch, Typography } from '@mui/material';
import { useCalcPrice } from 'hooks/useCalcPrice';
import { useState } from 'react';
import {
  BooleanField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  useTranslate,
  FunctionField,
  useRecordContext,
} from 'react-admin';

import { DEFAULT_COVER_URL, Tables } from 'types';
import { formatToYYYYMMDD, toArabicNumerals } from 'utils/helpers';

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
            <Container>
              {translate('resources.publications.fields.subject_id')} :
              <ReferenceField source="subject_id" reference="subjects" />
              <TextField source="nickname" />
              <Divider />
            </Container>

            <Container>
              {translate('resources.publications.fields.publisher')} :
              <ReferenceField source="publisher" reference="publishers" />
              <Divider />
            </Container>

            <Container>
              {translate('resources.publications.fields.academic_year')} :
              <ReferenceField source="academic_year" reference="academic_years" /> <Divider />
            </Container>

            <Container>
              {translate('resources.publications.fields.term')} :
              <FunctionField
                label="Name"
                render={(record) =>
                  ` ${translate(`resources.publications.labels.term.${record.term}`)}`
                }
              />
              <Divider />
            </Container>

            <Container>
              {translate('resources.publications.fields.year')} :
              <FunctionField source="year" render={(record) => toArabicNumerals(record.year)} />
              <Divider />
            </Container>

            <Container>
              {translate('resources.publications.fields.pages')} :
              <FunctionField source="pages" render={(record) => toArabicNumerals(record.pages)} />
              <Divider />
            </Container>

            <Container>
              {translate('resources.publications.fields.default_paper_size')} :
              <ReferenceField source="default_paper_size" reference="paper_types" />
              <Divider />
            </Container>

            <Container>
              <FunctionField
                source="created_at"
                render={(record) => {
                  if (record.price)
                    return `${translate('resources.publications.fields.price')} :${toArabicNumerals(record.price)}`;
                  else return <CustomTermField record={record} />;
                }}
              />
              <Divider />
            </Container>

            <Container>
              {translate('resources.publications.fields.created_at')} :
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
              {translate('resources.publications.fields.created_by')} :
              <ReferenceField
                source="created_by"
                reference="users"
                render={({ referenceRecord }: { referenceRecord?: Tables<'users'> }) =>
                  referenceRecord?.full_name
                }
              />
              <Divider />
            </Container>

            <Container>
              {translate('resources.publications.fields.updated_at')} :
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
              {translate('resources.publications.fields.updated_by')} :
              <ReferenceField
                source="updated_by"
                reference="users"
                render={({ referenceRecord }: { referenceRecord?: Tables<'users'> }) =>
                  referenceRecord?.full_name
                }
              />
              <Divider />
            </Container>

            <Container>
              {translate('resources.publications.fields.do_round')} :
              <BooleanField source="do_round" />
              <Divider />
            </Container>

            <Container>
              {translate('resources.publications.fields.additional_data')} :
              <TextField source="additional_data" />
              <Divider />
            </Container>

            <Container>
              {translate('resources.publications.fields.related_publications')} :
              <TextField source="related_publications" />
              <Divider />
            </Container>
          </Grid>
        </Grid>
      </SimpleShowLayout>
    </Show>
  );
};

const CustomTermField = ({ record }: { record: Tables<'publications'> }) => {
  const { calcPrice } = useCalcPrice();
  const translate = useTranslate();
  const [dublix, setDublix] = useState(true);
  if (!record) return null;

  const { cover, price } = calcPrice({ record });
  if (record) console.log(calcPrice({ record }));
  return (
    <Box>
      <Typography>{`نوع الغلاف : ${cover?.name}`}</Typography>
      <Typography>
        طباعة على الوجهين :
        <Switch
          value={dublix}
          defaultChecked={dublix}
          onChange={(event) => setDublix(event.target.checked)}
        />
      </Typography>
      <Typography>{`${translate('resources.publications.fields.price')}: ${toArabicNumerals(dublix ? price.twoFacesPrice : price.oneFacePrice)}`}</Typography>
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
