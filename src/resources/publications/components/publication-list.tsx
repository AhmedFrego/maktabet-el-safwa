import { Button, List, useListContext, useTranslate } from 'react-admin';
import { useNavigate } from 'react-router';
import { Box, Typography } from '@mui/material';

import { StyledContainer, ListActions, Loading } from 'components/UI';
import { useAppSelector } from 'store';
import { CustomFilterSidebar, Publication, PublicationCard } from '..';

export const PublicationsList = () => {
  return (
    <List
      actions={<ListActions />}
      aside={<CustomFilterSidebar />}
      queryOptions={{
        meta: {
          columns: [
            '*',
            'paper_size:paper_types(name)',
            'publisher_data:publishers(name)',
            'subject:subjects(name)',
          ],
        },
      }}
    >
      <PublicationsContainer />
    </List>
  );
};

const PublicationsContainer = () => {
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
            backgroundColor: theme.palette.background.default,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            my: 10,
            gap: 4,
            p: 3,
          })}
        >
          <Typography>{translate('ra.navigation.no_filtered_results')}</Typography>
          <Button sx={{ fontFamily: 'inherit' }} variant="outlined" onClick={handleClear}>
            {translate('ra.navigation.clear_filters')}
          </Button>
        </Box>
      ) : (
        publications &&
        publications.map((record) => {
          return (
            <PublicationCard
              key={record.id}
              onClick={() => {
                if (!state.isReserving) navigate(`${record.id}/show`);
              }}
              record={record}
            />
          );
        })
      )}
    </StyledContainer>
  );
};
