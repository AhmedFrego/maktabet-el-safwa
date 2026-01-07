import { useEffect } from 'react';
import { ImageField, ImageInput, useInput } from 'react-admin';
import { Box } from '@mui/material';

export const CoverInput = ({ source = 'cover_url' }: CoverInputProps) => {
  const { field } = useInput({ source });
  const currentValue = field.value;

  // Check if we have an image - either a file object or a URL string
  const hasImage = currentValue && (typeof currentValue === 'string' || currentValue.rawFile);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          if (blob) {
            const file = new File([blob], `pasted-image-${Date.now()}.png`, {
              type: blob.type,
            });
            // Create a preview URL for the pasted image
            const previewUrl = URL.createObjectURL(file);
            field.onChange({
              rawFile: file,
              src: previewUrl,
              title: file.name,
            });
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [field]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
          '& .RaFileInput-removeButton': {
            display: 'inline-flex',
          },
          '& .RaFileInput-preview': {
            width: '210px !important',
            height: '297px !important',
          },
        })}
      >
        <ImageField
          source="src"
          title="title"
          sx={{
            display: 'block',
            width: '210px',
            height: '297px',
            '& img': {
              width: '210px !important',
              height: '297px !important',
              objectFit: 'cover',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              display: 'block',
            },
          }}
        />
      </ImageInput>
      {/* Show preview for existing URL images */}
      {hasImage && typeof currentValue === 'string' && (
        <Box
          sx={{
            mt: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            component="img"
            src={currentValue}
            alt="Current cover"
            sx={{
              width: '210px !important',
              height: '297px !important',
              objectFit: 'cover',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              display: 'block',
            }}
          />
        </Box>
      )}
    </Box>
  );
};

interface CoverInputProps {
  source?: string;
}
