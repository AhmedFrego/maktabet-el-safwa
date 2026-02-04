import { useMemo } from 'react';
import { Button, List, useListContext, useTranslate, useGetMany } from 'react-admin';
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
        sort={{ field: 'subject_id', order: 'ASC' }}
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

  // Collect all related publication IDs that need to be fetched for stacked display
  const relatedIdsToFetch = useMemo(() => {
    if (!publications) return [];
    const ids = new Set<string>();

    publications.forEach((pub) => {
      // Only fetch related items for masters or standalone publications
      const hasRelated =
        pub.related_publications && (pub.related_publications as string[]).length > 0;
      const isMaster = pub.is_collection_master === true;

      if (hasRelated && isMaster) {
        (pub.related_publications as string[]).forEach((id) => ids.add(id));
      }
    });

    return Array.from(ids);
  }, [publications]);

  // Fetch related publications data
  const { data: relatedPublications } = useGetMany<Publication>(
    'publications',
    { ids: relatedIdsToFetch, meta: { columns: publicationsColumns } },
    { enabled: relatedIdsToFetch.length > 0 }
  );

  // Create a map of related publications for quick lookup
  const relatedPublicationsMap = useMemo(() => {
    const map = new Map<string, Publication>();
    relatedPublications?.forEach((pub) => map.set(pub.id, pub));
    return map;
  }, [relatedPublications]);

  // Filter publications to show only:
  // 1. Masters (is_collection_master = true)
  // 2. Standalone publications (no related_publications or empty array)
  // Hide non-master items that belong to a group (they'll be shown as stacked cards under their master)
  const filteredPublications = useMemo(() => {
    if (!publications) return [];

    return publications.filter((pub) => {
      const hasRelated =
        pub.related_publications && (pub.related_publications as string[]).length > 0;

      // If no related publications, always show
      if (!hasRelated) return true;

      // If has related publications, only show if it's the master
      // OR if no master exists in this group (show all until master is set)
      const isMaster = pub.is_collection_master === true;

      if (isMaster) return true;

      // Check if any publication in this group is a master
      const relatedIds = pub.related_publications as string[];
      const groupHasMaster = publications.some(
        (p) => p.is_collection_master === true && (relatedIds.includes(p.id) || p.id === pub.id)
      );

      // If no master in group, show all items individually
      return !groupHasMaster;
    });
  }, [publications]);

  // Get related items for a master publication
  const getRelatedItems = (publication: Publication): Publication[] => {
    if (!publication.is_collection_master || !publication.related_publications) return [];

    const relatedIds = publication.related_publications as string[];
    return relatedIds
      .map((id) => relatedPublicationsMap.get(id))
      .filter((pub): pub is Publication => pub !== undefined);
  };

  const handleClear = () => setFilters({}, []);

  if (isLoading) return <Loading />;

  return (
    <StyledContainer>
      {filteredPublications && !filteredPublications?.length ? (
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
        filteredPublications &&
        filteredPublications.map((record) => (
          <PublicationCard
            key={record.id}
            record={record}
            relatedItems={getRelatedItems(record)}
            onClick={() => !state.isReserving && !isDeletingMode && navigate(`${record.id}/show`)}
          />
        ))
      )}
    </StyledContainer>
  );
};
