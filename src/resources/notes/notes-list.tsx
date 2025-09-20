import { List, useGetList, useListContext } from 'react-admin';

import { RecordCard, recordCardStructure, StyledContainer } from 'components/UI';
import { Tables, type paperPricesType } from 'types';
import { toArabicNumerals, calcAndRound } from 'utils';
import { CustomFilterSidebar, Note } from '.';

export const NoteList = () => {
  const { data } = useGetList<Tables<'settings'>>('settings', {
    meta: { columns: ['*'] },
  });

  return (
    <List
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
      <NoteContainer paperPrices={data?.[0].paper_prices || null} />
    </List>
  );
};

const NoteContainer = ({ paperPrices }: CardGridProps) => {
  const { data, isLoading } = useListContext<Note>();
  if (isLoading) return <>Loading...</>;

  return (
    <StyledContainer>
      {data &&
        data.map((record: Note) => {
          const paperPrice = paperPrices?.find(
            (price) => price.id === record.default_paper_size
          )?.twoFacesPrice;
          return <RecordCard key={record.id} record={noteToCard(record, paperPrice || 0)} />;
        })}
    </StyledContainer>
  );
};

interface CardGridProps {
  paperPrices: paperPricesType[] | null;
}

const noteToCard = (record: Note, paperPrice: number): recordCardStructure => {
  return {
    bottomText: { start: record.subject.name, end: record.teacher.name },
    coverUrl: record.cover_url,
    chipText: toArabicNumerals(record.academicYear.short_name),
    tagText: toArabicNumerals(calcAndRound(paperPrice, record.pages, 5)),
  };
};
