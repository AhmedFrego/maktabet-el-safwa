import {
  AutocompleteInput,
  List,
  ReferenceInput,
  TextInput,
  useListContext,
  EditButton,
} from "react-admin";

const filters = [
  <TextInput source="year" />,
  <ReferenceInput source="subject_id" reference="subjects">
    <AutocompleteInput
      filterToQuery={(searchText) => ({ "name@ilike": `%${searchText}%` })}
    />
  </ReferenceInput>,
  <ReferenceInput source="academic_year" reference="academic_years">
    <AutocompleteInput
      filterToQuery={(searchText) => ({ "name@ilike": `%${searchText}%` })}
    />
  </ReferenceInput>,
  <ReferenceInput source="term" reference="terms">
    <AutocompleteInput
      filterToQuery={(searchText) => ({ "name@ilike": `%${searchText}%` })}
    />
  </ReferenceInput>,
];

export const NoteList = () => {
  return (
    <List filters={filters}>
      <CardGrid />

      {/* <DataTable>
        <DataTable.Col source="subject_id">
          <ReferenceField source="subject_id" reference="subjects" />
        </DataTable.Col>
        <DataTable.Col source="teacher_id">
          <ReferenceField source="teacher_id" reference="teachers" />
        </DataTable.Col>
        <DataTable.NumberCol source="pages" />
        <DataTable.Col source="cover_url" />
        <DataTable.Col source="year" />

        <DataTable.Col source="academic_year">
          <ReferenceField source="academic_year" reference="academic_years" />
        </DataTable.Col>
        <DataTable.Col source="default_paper_size">
          <ReferenceField source="default_paper_size" reference="paper_sizes" />
        </DataTable.Col>
        <DataTable.Col source="term">
          <ReferenceField source="term" reference="terms" />
        </DataTable.Col>
        <DataTable.Col source="additional_data" />
        <DataTable.Col source="related_notes" />
        <DataTable.Col source="nickname" />
        <DataTable.Col source="do_round">
          <BooleanField source="do_round" />
        </DataTable.Col>
      </DataTable> */}
    </List>
  );
};

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
} from "@mui/material";

const CardGrid = () => {
  const { data, isLoading } = useListContext();
  if (isLoading) return <>Loading...</>;
  console.log(data);

  return (
    <Grid container spacing={2}>
      {data && data.map((record: any) => RecordCard)}
    </Grid>
  );
};
