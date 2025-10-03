import { useTranslate } from 'react-admin';
import { Enums } from 'types/supabase-generated.types';

export const useAcademicYearsChoises = (): { id: Enums<'academic_years'>; name: string }[] => {
  const translate = useTranslate();
  return [
    { id: 'KG0', name: translate('custom.labels.academic_years.KG0.name') },
    { id: 'KG1', name: translate('custom.labels.academic_years.KG1.name') },
    { id: 'KG2', name: translate('custom.labels.academic_years.KG2.name') },
    { id: '1st_primary', name: translate('custom.labels.academic_years.1st_primary.name') },
    { id: '2nd_primary', name: translate('custom.labels.academic_years.2nd_primary.name') },
    { id: '3rd_primary', name: translate('custom.labels.academic_years.3rd_primary.name') },
    { id: '4th_primary', name: translate('custom.labels.academic_years.4th_primary.name') },
    { id: '5th_primary', name: translate('custom.labels.academic_years.5th_primary.name') },
    { id: '6th_primary', name: translate('custom.labels.academic_years.6th_primary.name') },
    { id: '1st_preparatory', name: translate('custom.labels.academic_years.1st_preparatory.name') },
    { id: '2nd_preparatory', name: translate('custom.labels.academic_years.2nd_preparatory.name') },
    { id: '3rd_preparatory', name: translate('custom.labels.academic_years.3rd_preparatory.name') },
    { id: '1st_secondary', name: translate('custom.labels.academic_years.1st_secondary.name') },
    { id: '2nd_secondary', name: translate('custom.labels.academic_years.2nd_secondary.name') },
    { id: '3rd_secondary', name: translate('custom.labels.academic_years.3rd_secondary.name') },
  ];
};
