import { PublicationTypesInput } from './PublicationTypesInput';
import { SubjectsInput } from './SubjectsInput';
import { PublishersInput } from './PublishersInput';
import { AcademicYearsInput } from './AcademicYearsInput';
import { number, TextInput } from 'react-admin';
import { CoverInput } from './CoverInput';
import { ExtrasAccordion } from './ExtrasAccordion';

export const PublicationForm = () => {
  return (
    <>
      <PublicationTypesInput source="publication_type" />
      <SubjectsInput />
      <PublishersInput />
      <AcademicYearsInput />
      <TextInput fullWidth source="pages" helperText={false} validate={[number()]} />
      <CoverInput />
      <ExtrasAccordion />
    </>
  );
};
