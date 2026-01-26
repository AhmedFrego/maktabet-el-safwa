import { TextField, type TextFieldProps } from '@mui/material';

export type NumericTextInputProps = Omit<TextFieldProps, 'type' | 'value' | 'onChange'> & {
  value: string | number;
  onValueChange: (value: string) => void;
  allowDecimal?: boolean;
};

const normalizeDigits = (input: string) =>
  input
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

export const NumericTextInput = ({
  value,
  onValueChange,
  allowDecimal = false,
  inputProps,
  ...props
}: NumericTextInputProps) => {
  const inputMode = allowDecimal ? 'decimal' : 'numeric';

  return (
    <TextField
      {...props}
      type="text"
      value={value}
      onChange={(e) => {
        const raw = normalizeDigits(e.target.value);
        const sanitized = allowDecimal
          ? raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
          : raw.replace(/[^0-9]/g, '');

        onValueChange(sanitized);
      }}
      inputProps={{
        inputMode,
        pattern: allowDecimal ? '[0-9.]*' : '[0-9]*',
        ...inputProps,
      }}
    />
  );
};
