import { TextInput, type TextInputProps } from 'react-admin';

/**
 * React Admin-compatible numeric text input.
 * Uses type="text" with inputMode="numeric" to avoid HTML number input quirks.
 * Normalizes Arabic-Indic (٠-٩) and Eastern Arabic (۰-۹) numerals to Western digits.
 */

const normalizeDigits = (input: string) =>
  input
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

const parseNumericValue = (value: string): number | null => {
  if (!value && value !== '0') return null;
  const normalized = normalizeDigits(value).replace(/[^0-9.]/g, '');
  if (!normalized) return null;
  const num = Number(normalized);
  return isNaN(num) ? null : num;
};

const formatNumericValue = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
};

export const NumericRaInput = (props: TextInputProps) => (
  <TextInput
    {...props}
    parse={parseNumericValue}
    format={formatNumericValue}
    inputProps={{
      inputMode: 'numeric' as const,
      pattern: '[0-9]*',
      ...props.inputProps,
    }}
  />
);
