import { AutocompleteInput, AutocompleteInputProps } from 'react-admin';
import { useAcademicYearsChoises } from 'resources/publications/hooks';

export const AcademicYearsInput = ({
  source = 'academic_year',
  ...props
}: AcademicYearsInputProps) => {
  const academicYearsChoises = useAcademicYearsChoises();
  return (
    <AutocompleteInput
      source={source}
      fullWidth
      helperText={false}
      choices={academicYearsChoises}
      {...props}
    />
  );
};

interface AcademicYearsInputProps extends AutocompleteInputProps {
  source?: string;
}
