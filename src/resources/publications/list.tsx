import { useEffect, useMemo, useRef } from 'react';
import { Button, List, useListContext, useTranslate, useGetMany, useStore } from 'react-admin';
import { Box, Typography } from '@mui/material';

import { StyledContainer, Loading, GridPagination } from 'components/UI';
import { useGridPageSize } from 'hooks';
import { useAppSelector, useAppDispatch, setPendingSuggestion } from 'store';

import { CustomFilterSidebar, PublicationCard } from './components';
import { Publication, publicationsColumns } from '.';
import { RelatedSuggestionModal } from 'resources/reservations/components';

export const PublicationsList = () => {
  const isReserving = useAppSelector((state) => state.reservation.isReserving);
  const pendingSuggestion = useAppSelector((state) => state.reservation.pendingSuggestion);
  const dispatch = useAppDispatch();
  const [rows, setRows] = useStore('publications.gridRows', 3);

  const handleCloseSuggestionModal = () => {
    dispatch(setPendingSuggestion(null));
  };

  return (
    <>
      <List
        actions={false}
        aside={<CustomFilterSidebar />}
        queryOptions={{ meta: { columns: publicationsColumns } }}
        sort={{ field: 'subject_id', order: 'ASC' }}
        pagination={
          <GridPagination rows={rows} onRowsChange={setRows} showActions={!isReserving} />
        }
        sx={{ '& .RaList-content': { maxWidth: 'none', width: '100%' } }}
      >
        <PublicationsContainer rows={rows} />
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

const PublicationsContainer = ({ rows }: { rows: number }) => {
  const { data: publications, isLoading, setFilters, setPerPage } = useListContext<Publication>();
  const translate = useTranslate();
  const [showGrouped] = useStore<boolean>('publications.showGrouped', true);
  const { containerRef, perPage } = useGridPageSize(rows);
  const prevPerPage = useRef(perPage);

  useEffect(() => {
    if (perPage !== prevPerPage.current) {
      prevPerPage.current = perPage;
      setPerPage(perPage);
    }
  }, [perPage, setPerPage]);

  // Collect all related publication IDs that need to be fetched for stacked display
  const relatedIdsToFetch = useMemo(() => {
    if (!publications) return [];
    const ids = new Set<string>();

    publications.forEach((pub) => {
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

  // Get related items for a master publication
  // Don't stack items if "show grouped" is disabled
  const getRelatedItems = (publication: Publication): Publication[] => {
    if (!showGrouped) return [];
    if (!publication.is_collection_master || !publication.related_publications) return [];

    const relatedIds = publication.related_publications as string[];
    return relatedIds
      .map((id) => relatedPublicationsMap.get(id))
      .filter((pub): pub is Publication => pub !== undefined);
  };

  const handleClear = () => setFilters({}, []);

  if (isLoading) return <Loading />;

  return (
    <StyledContainer ref={containerRef}>
      {publications && !publications.length ? (
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
          <PublicationCard key={record.id} record={record} relatedItems={getRelatedItems(record)} />
        ))
      )}
    </StyledContainer>
  );
};
