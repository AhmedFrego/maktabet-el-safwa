import { PublicationTypesInput } from './PublicationTypesInput';
import { SubjectsInput } from './SubjectsInput';
import { PublishersInput } from './PublishersInput';
import { AcademicYearsInput } from './AcademicYearsInput';
import { number, required, TextInput } from 'react-admin';
import { CoverInput } from './CoverInput';
import { ExtrasAccordion } from './ExtrasAccordion';

interface PublicationFormProps {
  onRelatedPublicationSuccess?: (data: unknown) => void;
}

export const PublicationForm = ({ onRelatedPublicationSuccess }: PublicationFormProps) => {
  return (
    <>
      <PublicationTypesInput source="publication_type" validate={[required()]} />
      <SubjectsInput validate={[required()]} />
      <PublishersInput validate={[required()]} />
      <AcademicYearsInput validate={[required()]} />
      <TextInput fullWidth source="pages" helperText={false} validate={[required(), number()]} />
      <CoverInput />
      <ExtrasAccordion onRelatedPublicationSuccess={onRelatedPublicationSuccess} />
    </>
  );
};
