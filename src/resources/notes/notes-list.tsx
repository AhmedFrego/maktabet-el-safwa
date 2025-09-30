import { List, useGetList, useListContext } from 'react-admin';
import { useNavigate } from 'react-router';

import { RecordCard, StyledContainer, ListActions } from 'components/UI';
import { useAppSelector } from 'store';
import { Tables, type PaperPricesType } from 'types';
import { calcRecordPrice, toArabicNumerals } from 'utils';
import { type Note, CustomFilterSidebar, noteToCard } from '.';

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
            'paper_size:paper_types(name)',
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
  const state = useAppSelector((state) => state.reservation);
  const navigate = useNavigate();

  if (isLoading) return <>Loading...</>;

  return (
    <StyledContainer>
      {notes &&
        notes.map((record: Note) => {
          record.price =
            record.price || calcRecordPrice({ record, paperPrices, roundTo: 5 }) || null;
          return (
            <RecordCard
              key={record.id}
              onClick={() => {
                if (!state.isReserving) navigate(`${record.id}/show`);
              }}
              record={{
                ...record,
                price: record.price || calcRecordPrice({ record, paperPrices, roundTo: 5 }) || null,
                title: `${record.subject.name} ${record.additional_data || ''} ${record.teacher.name} ${toArabicNumerals(record.academicYear.short_name)}`,
              }}
              recordToCard={noteToCard}
            />
          );
        })}
    </StyledContainer>
  );
};

interface CardGridProps {
  paperPrices: PaperPricesType[] | null;
}
