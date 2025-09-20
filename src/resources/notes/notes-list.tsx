import { CreateButton, List, TopToolbar, useGetList, useListContext } from 'react-admin';

import { RecordCard, StyledContainer } from 'components/UI';
import { Tables, type paperPricesType } from 'types';
import { calcAndRound } from 'utils';
import { CustomFilterSidebar, Note, noteToCard } from '.';
import { styled } from '@mui/material';

export const NoteList = () => {
  const { data: settings } = useGetList<Tables<'settings'>>('settings', {
    meta: { columns: ['*'] },
  });

  return (
    <List
      actions={<ListActions />}
      aside={<CustomFilterSidebar />}
      queryOptions={{
        meta: {
          columns: [
            '*',
            'academicYear:academic_years(name, short_name)',
            'term:terms(name)',
            'paper_size:paper_sizes(name)',
            'teacher:teachers(name)',
            'subject:subjects(name)',
          ],
        },
      }}
    >
      <NoteContainer paperPrices={settings?.[0].paper_prices || null} />
    </List>
  );
};

const NoteContainer = ({ paperPrices }: CardGridProps) => {
  const { data: notes, isLoading } = useListContext<Note>();
  if (isLoading) return <>Loading...</>;

  return (
    <StyledContainer>
      {notes &&
        notes.map((record: Note) => {
          const paperPrice = paperPrices?.find(
            (price) => price.id === record.default_paper_size
          )?.twoFacesPrice;

          return (
            <RecordCard
              key={record.id}
              record={noteToCard({
                ...record,
                price: record.price || calcAndRound(paperPrice || 0, record.pages, 5),
              })}
            />
          );
        })}
    </StyledContainer>
  );
};

interface CardGridProps {
  paperPrices: paperPricesType[] | null;
}

const ListActions = () => (
  <StyledTopToolbar>
    <StyledCreateButton label="إضافة مذكرة" />
  </StyledTopToolbar>
);

const StyledCreateButton = styled(CreateButton)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  fontWeight: 900,
  color: theme.palette.success.light,
}));

const StyledTopToolbar = styled(TopToolbar)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  backgroundColor: theme.palette.grey[100],
  width: '100%',
  justifyContent: 'center',
}));
