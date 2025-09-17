import {
  AutocompleteInput,
  List,
  ReferenceInput,
  TextInput,
  useGetList,
  useListContext,
} from 'react-admin';
import { Grid } from '@mui/material';

import { RecordCard, recordCardStructure } from 'components/UI';
import { Tables,type paperPricesType } from 'types';
import { toArabicNumerals,calcAndRound } from 'utils';

const filters = [
  <TextInput source="year" />,
  <ReferenceInput source="subject_id" reference="subjects">
    <AutocompleteInput
      filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
    />
  </ReferenceInput>,
  <ReferenceInput source="academic_year" reference="academic_years" alwaysOn>
    <AutocompleteInput
      label="السنة الدراسية"
      filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
    />
  </ReferenceInput>,
  <ReferenceInput source="term" reference="terms">
    <AutocompleteInput
      filterToQuery={(searchText) => ({ 'name@ilike': `%${searchText}%` })}
    />
  </ReferenceInput>,
];

export const NoteList = () => {

  const { data } = useGetList<Tables<'settings'>>(
    'settings',
    {
        meta: { columns: ['*'] }
    }
);

  return (
    <List
      filters={filters}
      queryOptions={{
        meta: { columns: ['*', 'academicYear:academic_years(name, short_name)', 'term:terms(name)', 'paper_size:paper_sizes(name)', 'teacher:teachers(name)', 'subject:subjects(name)'] },
      }}
    >
      <CardGrid paperPrices={data?.[0].paper_prices || null}/>
    </List>
  );
};



const CardGrid = ({paperPrices}:CardGridProps) => {
  const { data, isLoading } = useListContext<Note>();
  if (isLoading) return <>Loading...</>;
 
  return (
    <Grid container spacing={2}>
      {
      data &&
        data.map(
          (record: Note) => {
          const paperPrice = paperPrices?.find(price => price.id === record.default_paper_size)?.twoFacesPrice;
          return <Grid size={4} fontSize={'2rem'} key={record.id}>
            <RecordCard
              key={record.id}
              record={recordToCard(record,paperPrice||0)}
            />
          </Grid>
        
      }
      )
        }
    </Grid>
  );
};

interface CardGridProps {
  paperPrices :paperPricesType[] |null
}


interface Note extends Tables<'notes'> {
  teacher: { name: string }
  subject: { name: string }
  terms: { name: string }
  academicYear : { name: string, short_name: string }

}

const recordToCard = (record: Note, paperPrice:number): recordCardStructure => {
  console.log(paperPrice, record.pages)
    return { bottomText: { start: record.subject.name, end: record.teacher.name }, coverUrl: record.cover_url ,chipText:toArabicNumerals(record.academicYear.short_name),tagText:toArabicNumerals(calcAndRound(paperPrice,record.pages,5))};
  };