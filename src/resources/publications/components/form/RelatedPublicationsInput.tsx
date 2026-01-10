import { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Typography,
  CircularProgress,
  Autocomplete,
  TextField,
  Alert,
} from '@mui/material';
import { GroupWork, Add } from '@mui/icons-material';
import { useRecordContext, useTranslate, useNotify } from 'react-admin';
import { useFormContext } from 'react-hook-form';

import { supabase } from 'lib/supabase';
import { Tables } from 'types';
import { syncAddRelated, syncRemoveRelated } from 'utils/helpers/syncRelatedPublications';

interface PublicationOption {
  id: string;
  label: string;
  subject: string;
  academic_year: string;
}

/**
 * Component for managing related publications with bidirectional linking.
 * Displays current related publications as chips and allows adding/removing links.
 */
export const RelatedPublicationsInput = () => {
  const record = useRecordContext<Tables<'publications'>>();
  const translate = useTranslate();
  const notify = useNotify();
  const { setValue, watch } = useFormContext();

  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [relatedPubs, setRelatedPubs] = useState<PublicationOption[]>([]);
  const [options, setOptions] = useState<PublicationOption[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [syncing, setSyncing] = useState(false);

  const currentRelatedIds = watch('related_publications') as string[] | null;

  // Fetch current related publications data
  useEffect(() => {
    const fetchRelatedPublications = async () => {
      if (!currentRelatedIds || currentRelatedIds.length === 0) {
        setRelatedPubs([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('publications')
          .select('id, additional_data, subject:subjects(name), academic_year')
          .in('id', currentRelatedIds);

        if (error) throw error;

        setRelatedPubs(
          (data || []).map((pub) => ({
            id: pub.id,
            label: pub.additional_data || 'بدون عنوان',
            subject: (pub.subject as { name: string })?.name || '',
            academic_year: pub.academic_year || '',
          }))
        );
      } catch (error) {
        console.error('Error fetching related publications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPublications();
  }, [currentRelatedIds]);

  // Search for publications to add
  const handleSearch = async (searchText: string) => {
    if (!searchText || searchText.length < 2) {
      setOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('id, additional_data, subject:subjects(name), academic_year')
        .ilike('additional_data', `%${searchText}%`)
        .limit(10);

      if (error) throw error;

      // Filter out current publication and already linked ones
      const currentId = record?.id;
      const existingIds = currentRelatedIds || [];

      setOptions(
        (data || [])
          .filter((pub) => pub.id !== currentId && !existingIds.includes(pub.id))
          .map((pub) => ({
            id: pub.id,
            label: pub.additional_data || 'بدون عنوان',
            subject: (pub.subject as { name: string })?.name || '',
            academic_year: pub.academic_year || '',
          }))
      );
    } catch (error) {
      console.error('Error searching publications:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Add a related publication
  const handleAdd = async (option: PublicationOption | null) => {
    if (!option || !record?.id) return;

    setSyncing(true);
    try {
      // Update form state immediately
      const newRelatedIds = [...(currentRelatedIds || []), option.id];
      setValue('related_publications', newRelatedIds, { shouldDirty: true });

      // Sync bidirectionally in the database
      const result = await syncAddRelated(record.id, [option.id]);

      if (!result.success) {
        // Revert on failure
        setValue('related_publications', currentRelatedIds, { shouldDirty: true });
        notify(result.error || 'فشل إضافة الارتباط', { type: 'error' });
      } else {
        notify('تم إضافة الارتباط بنجاح', { type: 'success' });
        setRelatedPubs((prev) => [...prev, option]);
      }
    } catch (error) {
      console.error('Error adding related publication:', error);
      notify('فشل إضافة الارتباط', { type: 'error' });
    } finally {
      setSyncing(false);
      setInputValue('');
      setOptions([]);
    }
  };

  // Remove a related publication
  const handleRemove = async (removedId: string) => {
    if (!record?.id) return;

    setSyncing(true);
    try {
      // Update form state immediately
      const newRelatedIds = (currentRelatedIds || []).filter((id) => id !== removedId);
      setValue('related_publications', newRelatedIds.length > 0 ? newRelatedIds : null, {
        shouldDirty: true,
      });

      // Sync bidirectionally in the database
      const result = await syncRemoveRelated(record.id, removedId);

      if (!result.success) {
        // Revert on failure
        setValue('related_publications', currentRelatedIds, { shouldDirty: true });
        notify(result.error || 'فشل إزالة الارتباط', { type: 'error' });
      } else {
        notify('تم إزالة الارتباط بنجاح', { type: 'success' });
        setRelatedPubs((prev) => prev.filter((p) => p.id !== removedId));
      }
    } catch (error) {
      console.error('Error removing related publication:', error);
      notify('فشل إزالة الارتباط', { type: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  // Only show in edit mode (when record exists)
  if (!record?.id) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        يمكنك ربط المنشورات بعد الحفظ
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <GroupWork color="primary" />
        <Typography variant="subtitle1" fontWeight="bold">
          {translate('resources.publications.fields.related_publications')}
        </Typography>
        {syncing && <CircularProgress size={16} />}
      </Box>

      {/* Current related publications as chips */}
      {loading ? (
        <CircularProgress size={24} />
      ) : relatedPubs.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {relatedPubs.map((pub) => (
            <Chip
              key={pub.id}
              label={`${pub.label} (${pub.subject})`}
              onDelete={() => handleRemove(pub.id)}
              color="primary"
              variant="outlined"
              disabled={syncing}
            />
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {translate('resources.publications.messages.no_related_publications')}
        </Typography>
      )}

      {/* Search and add new related publications */}
      <Autocomplete
        options={options}
        loading={searchLoading}
        inputValue={inputValue}
        onInputChange={(_, newValue) => {
          setInputValue(newValue);
          handleSearch(newValue);
        }}
        onChange={(_, option) => handleAdd(option)}
        getOptionLabel={(option) => option.label}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.id}>
            <Box>
              <Typography variant="body1">{option.label}</Typography>
              <Typography variant="caption" color="text.secondary">
                {option.subject} - {option.academic_year}
              </Typography>
            </Box>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="البحث عن منشور للربط"
            placeholder="اكتب للبحث..."
            size="small"
            InputProps={{
              ...params.InputProps,
              startAdornment: <Add color="action" sx={{ mr: 1 }} />,
              endAdornment: (
                <>
                  {searchLoading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        disabled={syncing}
        noOptionsText="لا توجد نتائج"
        loadingText="جاري البحث..."
        clearOnBlur
        blurOnSelect
      />
    </Box>
  );
};
