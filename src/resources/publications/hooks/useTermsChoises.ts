import { useTranslate } from 'react-admin';
import { Enums } from 'types';

export const useTermsChoises = (): {
  id: Enums<'term'>;
  name: string;
}[] => {
  const translate = useTranslate();

  return [
    { id: '1st', name: translate('resources.publications.labels.term.1st') },
    { id: '2nd', name: translate('resources.publications.labels.term.2nd') },
    { id: 'full_year', name: translate('resources.publications.labels.term.full_year') },
  ];
};
