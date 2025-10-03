import { Button, List, useListContext, useTranslate } from 'react-admin';
import { useNavigate } from 'react-router';

import { RecordCard, StyledContainer, ListActions, Loading } from 'components/UI';
import { useAppSelector } from 'store';
import { toArabicNumerals } from 'utils';
import { type Publication, CustomFilterSidebar, noteToCard } from '.';
import { Box, Typography } from '@mui/material';

export const PublicationsList = () => {
  return (
    <List
      actions={<ListActions />}
      aside={<CustomFilterSidebar />}
      queryOptions={{
        meta: {
          columns: [
            '*',
            'academicYear:academic_years(name, short_name)',
            'paper_size:paper_types(name)',
            'publisher_data:publishers(name)',
            'subject:subjects(name)',
          ],
        },
      }}
    >
      <NoteContainer />
    </List>
  );
};

const NoteContainer = () => {
  const { data: publications, isLoading, setFilters } = useListContext<Publication>();
  const state = useAppSelector((state) => state.reservation);
  const navigate = useNavigate();
  const translate = useTranslate();

  const handleClear = () => setFilters({}, []);

  if (isLoading) return <Loading />;

  return (
    <StyledContainer>
      {publications && !publications?.length ? (
        <Box
          sx={(theme) => ({
            my: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            backgroundColor: theme.palette.background.default,
            p: 3,
            borderRadius: 2,
          })}
        >
          <Typography>{translate('ra.navigation.no_filtered_results')}</Typography>
          <Button sx={{ fontFamily: 'inherit' }} variant="outlined" onClick={handleClear}>
            {translate('ra.navigation.clear_filters')}
          </Button>
        </Box>
      ) : (
        publications &&
        publications.map((record: Publication) => {
          return (
            <RecordCard
              key={record.id}
              onClick={() => {
                if (!state.isReserving) navigate(`${record.id}/show`);
              }}
              record={{
                ...record,
                title: `${record.subject.name} ${record.additional_data || ''} ${record.publisher_data.name} ${toArabicNumerals(record.academicYear.short_name)}`,
              }}
              recordToCard={noteToCard}
            />
          );
        })
      )}
    </StyledContainer>
  );
};
