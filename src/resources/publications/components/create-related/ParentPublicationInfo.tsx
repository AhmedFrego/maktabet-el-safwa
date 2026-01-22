import { Typography } from '@mui/material';
import { useTranslate } from 'react-admin';
import { Tables } from 'types';
import { toArabicNumerals } from 'utils';

interface ParentPublicationInfoProps {
  publication: Pick<
    Tables<'publications'>,
    'subject_id' | 'publisher_id' | 'academic_year' | 'term' | 'year'
  >;
  subjectName?: string;
  publisherName?: string;
}

export const ParentPublicationInfo = ({
  publication,
  subjectName,
  publisherName,
}: ParentPublicationInfoProps) => {
  const translate = useTranslate();

  return (
    <Typography
      variant="body1"
      sx={{
        fontFamily: 'inherit',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        color: 'primary.main',
        textAlign: 'center',
        py: 1,
        mb: 2,
        bgcolor: 'action.hover',
        borderRadius: 1,
      }}
    >
      {`${subjectName || publication.subject_id} ${publisherName || publication.publisher_id} - ${translate(
        `custom.labels.academic_years.${publication.academic_year}.short_name`
      )} - ${publication.term ? translate(`custom.labels.terms.${publication.term}.name`) : ''} ${toArabicNumerals(
        publication.year
      )}`}
    </Typography>
  );
};
