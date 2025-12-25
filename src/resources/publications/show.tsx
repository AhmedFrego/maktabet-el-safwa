import {
  Box,
  Grid,
  Switch,
  Typography,
  Autocomplete,
  TextField as MuiTextField,
} from '@mui/material';
import { useState, useEffect } from 'react';
import {
  Show,
  TextField,
  useTranslate,
  BooleanField,
  FunctionField,
  ReferenceField,
  useRecordContext,
  SimpleShowLayout,
  useDataProvider,
} from 'react-admin';

import { DividedContainer } from 'components/UI';
import { useCalcPrice, useGetCovers } from 'hooks';
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
              <ReferenceField source="publisher_id" reference="publishers" />
            </DividedContainer>

            <DividedContainer>
              {`${translate('resources.publications.fields.academic_year')}: `}
              <FunctionField
                source="academic_year"
                render={(record) => (
                  <>{translate(`custom.labels.academic_years.${record.academic_year}.name`)}</>
                )}
              />
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
  const { getCovers } = useGetCovers();
  const translate = useTranslate();
  const dataProvider = useDataProvider();
  const [dublix, setDublix] = useState(true);
  const [paperTypeId, setPaperTypeId] = useState(record?.paper_type_id);
  const [selectedCover, setSelectedCover] = useState<Tables<'cover_types'> | null>(null);
  const [paperTypes, setPaperTypes] = useState<Tables<'paper_types'>[]>([]);

  useEffect(() => {
    dataProvider
      .getList('paper_types', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'name', order: 'ASC' },
        filter: {},
      })
      .then(({ data }) => setPaperTypes(data));
  }, [dataProvider]);

  if (!record) return null;

  const modifiedRecord = { ...record, paper_type_id: paperTypeId };
  const { cover, price } = calcPrice({ record: modifiedRecord, coverId: selectedCover?.id });
  const selectedPaperType = paperTypes.find((pt) => pt.id === paperTypeId);

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>
          {translate('resources.publications.fields.paper_type')}
        </Typography>
        <Autocomplete
          size="small"
          options={paperTypes}
          value={selectedPaperType || null}
          onChange={(_, newValue) => setPaperTypeId(newValue?.id || '')}
          getOptionLabel={(option) => option.name || ''}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => <MuiTextField {...params} />}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>
          {translate('resources.publications.fields.cover_type')}
        </Typography>
        <Autocomplete
          size="small"
          key={paperTypeId} 
          options={getCovers(paperTypeId).covers || []}
          value={selectedCover || cover?.name ? cover : null}
          onChange={(_, newValue) => {
            setSelectedCover(newValue ?? null);
          }}
          getOptionLabel={(option) => option.name || ''}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => <MuiTextField {...params} />}
        />
      </Box>
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
