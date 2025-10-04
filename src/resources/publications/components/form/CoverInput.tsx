import { FileField, ImageInput } from 'react-admin';

export const CoverInput = ({ source = 'cover_url' }: CoverInputProps) => {
  return (
    <ImageInput
      source={source}
      accept={{ 'image/*': ['.png', '.jpg'] }}
      helperText={false}
      sx={(theme) => ({
        '& .RaFileInput-dropZone': {
          backgroundColor: theme.palette.background.paper,
          '& p': {
            m: 0.5,
          },
        },
      })}
    >
      <FileField source="src" title="title" />
    </ImageInput>
  );
};

interface CoverInputProps {
  source?: string;
}
