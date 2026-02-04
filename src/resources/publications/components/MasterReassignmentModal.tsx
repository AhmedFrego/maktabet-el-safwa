import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import { Warning, Star, Delete } from '@mui/icons-material';
import { useTranslate } from 'react-admin';

import { supabase } from 'lib/supabase';
import { Tables } from 'types';
import { toArabicNumerals } from 'utils';
import {
  setCollectionMaster,
  removeFromAllRelated,
  fetchGroupPublications,
} from 'utils/helpers/syncRelatedPublications';

interface MasterReassignmentModalProps {
  open: boolean;
  onClose: () => void;
  publication: Tables<'publications'>;
  onConfirm: () => void;
}

type Action = 'select_new_master' | 'remove_from_group';

interface RelatedPublication {
  id: string;
  additional_data: string | null;
  subject?: { name: string };
  publisher?: { name: string };
}

export const MasterReassignmentModal = ({
  open,
  onClose,
  publication,
  onConfirm,
}: MasterReassignmentModalProps) => {
  const translate = useTranslate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [relatedPublications, setRelatedPublications] = useState<RelatedPublication[]>([]);
  const [selectedAction, setSelectedAction] = useState<Action>('select_new_master');
  const [selectedNewMaster, setSelectedNewMaster] = useState<string>('');
  const [selectedToRemove, setSelectedToRemove] = useState<string[]>([]);

  // Fetch related publications when modal opens
  useEffect(() => {
    const fetchRelated = async () => {
      if (!open || !publication.related_publications) return;

      setIsFetching(true);
      const relatedIds = publication.related_publications as string[];
      const { data } = await fetchGroupPublications(relatedIds);

      if (data) {
        setRelatedPublications(data as RelatedPublication[]);
        // Default select first item as new master
        if (data.length > 0) {
          setSelectedNewMaster(data[0].id);
        }
      }
      setIsFetching(false);
    };

    fetchRelated();
  }, [open, publication.related_publications]);

  const handleActionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAction(event.target.value as Action);
  };

  const handleNewMasterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedNewMaster(event.target.value);
  };

  const handleRemoveToggle = (id: string) => {
    setSelectedToRemove((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    setIsLoading(true);

    try {
      if (selectedAction === 'select_new_master' && selectedNewMaster) {
        // First set the new master
        const masterResult = await setCollectionMaster(selectedNewMaster);
        if (!masterResult.success) {
          console.error('Failed to set new master:', masterResult.error);
          setIsLoading(false);
          return;
        }
      }

      // Remove items selected for removal
      for (const id of selectedToRemove) {
        await removeFromAllRelated(id);
        // Also delete the publication if user selected to remove it
        await supabase.from('publications').delete().eq('id', id);
      }

      // Remove the current publication from all related
      await removeFromAllRelated(publication.id);

      // Proceed with the original delete action
      onConfirm();
    } catch (error) {
      console.error('Error in master reassignment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPublicationLabel = (pub: RelatedPublication) => {
    const parts = [];
    if (pub.subject?.name) parts.push(pub.subject.name);
    if (pub.additional_data) parts.push(`(${pub.additional_data})`);
    if (pub.publisher?.name) parts.push(`- ${pub.publisher.name}`);
    return parts.join(' ') || pub.id;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { direction: 'rtl' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="warning" />
        <Typography variant="h6" component="span" sx={{ fontFamily: 'inherit' }}>
          {translate('resources.publications.messages.master_deletion_title')}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2, fontFamily: 'inherit' }}>
          {translate('resources.publications.messages.master_deletion_warning')}
        </Alert>

        {isFetching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="body2" sx={{ mb: 2, fontFamily: 'inherit' }}>
              {translate('resources.publications.messages.related_count', {
                count: toArabicNumerals(relatedPublications.length),
              })}
            </Typography>

            <RadioGroup value={selectedAction} onChange={handleActionChange}>
              <FormControlLabel
                value="select_new_master"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star fontSize="small" color="warning" />
                    <Typography sx={{ fontFamily: 'inherit' }}>
                      {translate('resources.publications.messages.select_new_master')}
                    </Typography>
                  </Box>
                }
              />

              {selectedAction === 'select_new_master' && (
                <Box sx={{ pr: 4, mb: 2 }}>
                  <RadioGroup value={selectedNewMaster} onChange={handleNewMasterChange}>
                    {relatedPublications.map((pub) => (
                      <FormControlLabel
                        key={pub.id}
                        value={pub.id}
                        control={<Radio size="small" />}
                        label={
                          <Typography variant="body2" sx={{ fontFamily: 'inherit' }}>
                            {getPublicationLabel(pub)}
                          </Typography>
                        }
                      />
                    ))}
                  </RadioGroup>
                </Box>
              )}

              <Divider sx={{ my: 1 }} />

              <FormControlLabel
                value="remove_from_group"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Delete fontSize="small" color="error" />
                    <Typography sx={{ fontFamily: 'inherit' }}>
                      {translate('resources.publications.messages.remove_from_group')}
                    </Typography>
                  </Box>
                }
              />

              {selectedAction === 'remove_from_group' && (
                <Box sx={{ pr: 4, mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    {translate('resources.publications.messages.select_items_to_remove')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {relatedPublications.map((pub) => (
                      <Chip
                        key={pub.id}
                        label={pub.additional_data || pub.subject?.name || pub.id}
                        onClick={() => handleRemoveToggle(pub.id)}
                        color={selectedToRemove.includes(pub.id) ? 'error' : 'default'}
                        variant={selectedToRemove.includes(pub.id) ? 'filled' : 'outlined'}
                        sx={{ fontFamily: 'inherit' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </RadioGroup>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading} sx={{ fontFamily: 'inherit' }}>
          {translate('ra.action.cancel')}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={
            isLoading ||
            isFetching ||
            (selectedAction === 'select_new_master' && !selectedNewMaster)
          }
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Delete />}
          sx={{ fontFamily: 'inherit' }}
        >
          {translate('ra.action.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
