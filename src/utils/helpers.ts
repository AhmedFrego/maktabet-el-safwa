export const mapArrayToOption = <T>(
  array: T[] = [],
  idKey: keyof T,
  valueKey: keyof T,
  secondValueKey?: keyof T
): { id: string; value: string; secondValue?: string | undefined }[] =>
  array.map((item) => {
    const option = {
      id: String(item[idKey]),
      value: String(item[valueKey]),
      secondValue: secondValueKey ? String(item[secondValueKey]) : undefined,
    };

    return option;
  });

export const isIn = <T>(arr: T[], key: keyof T, val: string): T | undefined => {
  return arr.find((item) => item[key] === val);
};

export const extractIds = (items: { id: string }[]): string[] => items.map((item) => item.id);

export const normalizeFieldId = <T extends { id: string; name: string }>(
  value: string,
  list: T[]
): string => {
  const match = list.find((item) => item.name === value);
  return match?.id || value;
};

export const calcAndRound = (n1: number, n2: number, x: number): number => {
  let result = (n1 * n2) / 100;

  if (result % x !== 0) result = Math.ceil(result / x) * x;

  return result;
};

export const assignIfChanged = <T>(
  target: Partial<T>,
  source: T,
  original: T,
  keys: (keyof T)[]
) => {
  keys.forEach((key) => {
    if (source[key] !== original[key]) {
      target[key] = source[key];
    }
  });
};

export const extractFileName = (url: string | null): string | undefined => {
  const marker = 'public/covers/';
  const index = url?.indexOf(marker);
  if (index === -1 || !index) return undefined;

  return url?.slice(index + marker.length);
};

export const toArabicNumerals = (input: string | number): string => {
  const englishToArabicMap: Record<string, string> = {
    '0': '٠',
    '1': '١',
    '2': '٢',
    '3': '٣',
    '4': '٤',
    '5': '٥',
    '6': '٦',
    '7': '٧',
    '8': '٨',
    '9': '٩',
  };

  return String(input).replace(/[0-9]/g, (digit) => englishToArabicMap[digit]);
};

export const toSupabaseTimestamp = (date: Date = new Date()) => {
  const iso = date.toISOString();

  const [datePart, timePart] = iso.split('T');
  const [time, msZ] = timePart.split('.');
  const ms = msZ.replace('Z', '');

  const micro = ms.padEnd(6, '0');

  return `${datePart} ${time}.${micro}+00`;
};
