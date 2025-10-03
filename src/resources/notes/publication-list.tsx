import { List, useListContext } from 'react-admin';
import { useNavigate } from 'react-router';

import { RecordCard, StyledContainer, ListActions } from 'components/UI';
import { useAppSelector } from 'store';
import { toArabicNumerals } from 'utils';
import { type Publication, CustomFilterSidebar, publicationToCard } from '.';

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
  const { data: publications, isLoading } = useListContext<Publication>();
  const state = useAppSelector((state) => state.reservation);
  const navigate = useNavigate();

  if (isLoading) return <>Loading...</>;

  return (
    <StyledContainer>
      {publications &&
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
              recordToCard={publicationToCard}
            />
          );
        })}
    </StyledContainer>
  );
};
