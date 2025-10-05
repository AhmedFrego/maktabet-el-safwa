import { Checkbox, CheckboxProps } from '@mui/material';
import { useInput } from 'react-admin';

export const CustomCheckBox = ({ source, label, ...props }: CustomCheckBoxProps) => {
  const { id, field } = useInput({ source });
  return (
    <label htmlFor={id}>
      <Checkbox
        {...field}
        {...props}
        id={id}
        checked={!!field.value}
        onChange={(e) => field.onChange(e.target.checked)}
      />
      {label}
    </label>
  );
};
interface CustomCheckBoxProps extends CheckboxProps {
  source: string;
  label: string;
}
