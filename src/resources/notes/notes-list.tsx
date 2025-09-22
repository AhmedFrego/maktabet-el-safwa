import {
  CreateButton,
  List,
  TopToolbar,
  useGetList,
  useListContext,
  useTranslate,
} from 'react-admin';
import { useNavigate } from 'react-router';
import { Button, ButtonGroup, styled } from '@mui/material';
import { EditNote } from '@mui/icons-material';

import { RecordCard, StyledContainer } from 'components/UI';
import { useAppDispatch, useAppSelector, setIsReserving } from 'store';
import { Tables, type paperPricesType } from 'types';
import { calcRecordPrice } from 'utils';
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
              }}
              recordToCard={noteToCard}
            />
          );
        })}
    </StyledContainer>
  );
};

interface CardGridProps {
  paperPrices: paperPricesType[] | null;
}

const ListActions = () => {
  const translate = useTranslate();
  const state = useAppSelector((state) => state.reservation);
  const dispatch = useAppDispatch();
  return (
    <StyledTopToolbar>
      <ButtonGroup variant="contained" aria-label="Basic button group">
        <StyledCreateButton />
        <Button onClick={() => dispatch(setIsReserving(true))}>
          <EditNote />
          {translate('resources.notes.actions.reserve')}
        </Button>

        <Button onClick={() => dispatch(setIsReserving(false))}>
          {state.isReserving ? 'is' : 'isnot'}
        </Button>
      </ButtonGroup>
    </StyledTopToolbar>
  );
};

const StyledCreateButton = styled(CreateButton)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  fontWeight: 900,
  // color: theme.palette.success.light,
}));

const StyledTopToolbar = styled(TopToolbar)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  backgroundColor: theme.palette.grey[100],
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0',
}));
