import { Button, List, useListContext, useTranslate } from 'react-admin';
import { useNavigate } from 'react-router';
import { Box, Typography } from '@mui/material';

import { StyledContainer, ListActions, Loading } from 'components/UI';
import { useAppSelector, useAppDispatch, setPendingSuggestion } from 'store';

import { CustomFilterSidebar, PublicationCard } from './components';
import { Publication, publicationsColumns } from '.';
import { RelatedSuggestionModal } from 'resources/reservations/components';

export const PublicationsList = () => {
  const isReserving = useAppSelector((state) => state.reservation.isReserving);
  const pendingSuggestion = useAppSelector((state) => state.reservation.pendingSuggestion);
  const dispatch = useAppDispatch();

  const handleCloseSuggestionModal = () => {
    dispatch(setPendingSuggestion(null));
  };

  return (
    <>
      <List
        actions={isReserving ? false : <ListActions />}
        aside={<CustomFilterSidebar />}
        queryOptions={{ meta: { columns: publicationsColumns } }}
        sort={{ field: 'subject', order: 'ASC' }}
      >
        <PublicationsContainer />
      </List>

      {/* Related Publications Suggestion Modal */}
      {pendingSuggestion && (
        <RelatedSuggestionModal
          open={!!pendingSuggestion}
          onClose={handleCloseSuggestionModal}
          triggerPublication={pendingSuggestion.triggerPublication as unknown as Publication}
          relatedIds={pendingSuggestion.relatedIds}
        />
      )}
    </>
  );
};

const PublicationsContainer = () => {
  const { data: publications, isLoading, setFilters } = useListContext<Publication>();
  const state = useAppSelector((state) => state.reservation);
  const isDeletingMode = useAppSelector((state) => state.deletion.isDeletingMode);
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
        publications.map((record) => (
          <PublicationCard
            key={record.id}
            record={record}
            onClick={() => !state.isReserving && !isDeletingMode && navigate(`${record.id}/show`)}
          />
        ))
      )}
    </StyledContainer>
  );
};
