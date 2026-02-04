import { supabase } from 'lib/supabase';
import { TablesUpdate } from 'types';

/**
 * Utility functions for managing bidirectional related publications links.
 * When publication A is linked to B, B is automatically linked to A.
 */

/**
 * Set a publication as the collection master for its related group.
 * Sets is_collection_master=true on the target, false on all related items.
 *
 * @param publicationId - The ID of the publication to set as master
 * @returns Promise resolving when all updates complete
 */
export const setCollectionMaster = async (
  publicationId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Fetch the publication and its related items
    const { data: publication, error: fetchError } = await supabase
      .from('publications')
      .select('id, related_publications')
      .eq('id', publicationId)
      .single();

    if (fetchError) throw fetchError;
    if (!publication) throw new Error('Publication not found');

    const relatedIds = (publication.related_publications as string[]) || [];

    // Set the target publication as master
    const { error: masterError } = await supabase
      .from('publications')
      .update({ is_collection_master: true } as TablesUpdate<'publications'>)
      .eq('id', publicationId);

    if (masterError) throw masterError;

    // Set all related publications as non-masters
    if (relatedIds.length > 0) {
      const { error: relatedError } = await supabase
        .from('publications')
        .update({ is_collection_master: false } as TablesUpdate<'publications'>)
        .in('id', relatedIds);

      if (relatedError) throw relatedError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error setting collection master:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل تعيين المنشور الرئيسي',
    };
  }
};

/**
 * Get the master publication of a group.
 *
 * @param publicationIds - Array of publication IDs in the group
 * @returns The master publication ID or null if none exists
 */
export const getMasterOfGroup = async (
  publicationIds: string[]
): Promise<{ masterId: string | null; error?: string }> => {
  try {
    if (publicationIds.length === 0) {
      return { masterId: null };
    }

    const { data: master, error: fetchError } = await supabase
      .from('publications')
      .select('id')
      .in('id', publicationIds)
      .eq('is_collection_master', true)
      .maybeSingle();

    if (fetchError) throw fetchError;

    return { masterId: master?.id || null };
  } catch (error) {
    console.error('Error getting group master:', error);
    return {
      masterId: null,
      error: error instanceof Error ? error.message : 'فشل جلب المنشور الرئيسي',
    };
  }
};

/**
 * Add bidirectional links between a publication and its related publications.
 * Updates both the source publication and all target publications.
 * Auto-sets the parent (first ID in relatedIds) as master if no master exists in the group.
 *
 * @param publicationId - The ID of the publication being edited
 * @param relatedIds - Array of publication IDs to link to
 * @param parentId - Optional parent publication ID to auto-set as master
 * @returns Promise resolving when all updates complete
 */
export const syncAddRelated = async (
  publicationId: string,
  relatedIds: string[],
  parentId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (relatedIds.length === 0) {
      return { success: true };
    }

    // Fetch current related_publications for all involved publications
    const allIds = [publicationId, ...relatedIds];
    const { data: publications, error: fetchError } = await supabase
      .from('publications')
      .select('id, related_publications, is_collection_master')
      .in('id', allIds);

    if (fetchError) throw fetchError;
    if (!publications) throw new Error('Failed to fetch publications');

    // Check if any publication in the group is already a master
    const hasMaster = publications.some((pub) => pub.is_collection_master === true);

    // Build update map
    const updates: { id: string; related_publications: string[] }[] = [];

    publications.forEach((pub) => {
      const currentRelated = (pub.related_publications as string[]) || [];
      const newRelated = [...currentRelated];

      if (pub.id === publicationId) {
        // For the source publication, add all relatedIds
        relatedIds.forEach((relId) => {
          if (!newRelated.includes(relId)) {
            newRelated.push(relId);
          }
        });
      } else {
        // For target publications, add the source publicationId
        if (!newRelated.includes(publicationId)) {
          newRelated.push(publicationId);
        }
        // Also add other related IDs to maintain full group connectivity
        relatedIds.forEach((relId) => {
          if (relId !== pub.id && !newRelated.includes(relId)) {
            newRelated.push(relId);
          }
        });
      }

      // Only update if there are changes
      if (
        newRelated.length !== currentRelated.length ||
        !newRelated.every((id) => currentRelated.includes(id))
      ) {
        updates.push({ id: pub.id, related_publications: newRelated });
      }
    });

    // Perform all updates
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('publications')
        .update({
          related_publications: update.related_publications,
        } as TablesUpdate<'publications'>)
        .eq('id', update.id);

      if (updateError) throw updateError;
    }

    // Auto-set parent as master if no master exists in the group
    if (!hasMaster && parentId) {
      const masterResult = await setCollectionMaster(parentId);
      if (!masterResult.success) {
        console.warn('Failed to auto-set master:', masterResult.error);
        // Don't fail the whole operation, just log the warning
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error syncing related publications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل تحديث المنشورات المرتبطة',
    };
  }
};

/**
 * Remove a bidirectional link between two publications.
 * Removes the link from both sides.
 *
 * @param publicationId - The source publication ID
 * @param removedId - The publication ID to unlink
 * @returns Promise resolving when updates complete
 */
export const syncRemoveRelated = async (
  publicationId: string,
  removedId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Fetch both publications
    const { data: publications, error: fetchError } = await supabase
      .from('publications')
      .select('id, related_publications')
      .in('id', [publicationId, removedId]);

    if (fetchError) throw fetchError;
    if (!publications) throw new Error('Failed to fetch publications');

    // Update both publications
    for (const pub of publications) {
      const currentRelated = (pub.related_publications as string[]) || [];
      const idToRemove = pub.id === publicationId ? removedId : publicationId;
      const newRelated = currentRelated.filter((id) => id !== idToRemove);

      const { error: updateError } = await supabase
        .from('publications')
        .update({
          related_publications: newRelated.length > 0 ? newRelated : null,
        } as TablesUpdate<'publications'>)
        .eq('id', pub.id);

      if (updateError) throw updateError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing related publication:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل إزالة الارتباط',
    };
  }
};

/**
 * Remove a publication from ALL related publications' lists.
 * Used for cascade delete when a publication is deleted.
 *
 * @param publicationId - The publication ID being deleted
 * @returns Promise resolving when all updates complete
 */
export const removeFromAllRelated = async (
  publicationId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First, get the publication to find its related publications
    const { data: publication, error: fetchError } = await supabase
      .from('publications')
      .select('related_publications')
      .eq('id', publicationId)
      .single();

    if (fetchError) throw fetchError;

    const relatedIds = (publication?.related_publications as string[]) || [];

    if (relatedIds.length === 0) {
      return { success: true };
    }

    // Fetch all related publications
    const { data: relatedPubs, error: relatedFetchError } = await supabase
      .from('publications')
      .select('id, related_publications')
      .in('id', relatedIds);

    if (relatedFetchError) throw relatedFetchError;
    if (!relatedPubs) return { success: true };

    // Remove publicationId from each related publication
    for (const relPub of relatedPubs) {
      const currentRelated = (relPub.related_publications as string[]) || [];
      const newRelated = currentRelated.filter((id) => id !== publicationId);

      const { error: updateError } = await supabase
        .from('publications')
        .update({
          related_publications: newRelated.length > 0 ? newRelated : null,
        } as TablesUpdate<'publications'>)
        .eq('id', relPub.id);

      if (updateError) throw updateError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing from all related:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل إزالة الارتباطات',
    };
  }
};

/**
 * Get all members of a related publications group.
 * Starting from one publication, finds all connected publications.
 *
 * @param publicationId - Any publication ID in the group
 * @returns Array of all publication IDs in the group (including the input ID)
 */
export const getFullGroup = async (
  publicationId: string
): Promise<{ ids: string[]; error?: string }> => {
  try {
    const { data: publication, error: fetchError } = await supabase
      .from('publications')
      .select('id, related_publications')
      .eq('id', publicationId)
      .single();

    if (fetchError) throw fetchError;
    if (!publication) return { ids: [publicationId] };

    const relatedIds = (publication.related_publications as string[]) || [];
    const allIds = [publicationId, ...relatedIds];

    return { ids: [...new Set(allIds)] };
  } catch (error) {
    console.error('Error getting full group:', error);
    return {
      ids: [publicationId],
      error: error instanceof Error ? error.message : 'فشل جلب المجموعة',
    };
  }
};

/**
 * Fetch full publication data for a group.
 *
 * @param publicationIds - Array of publication IDs to fetch
 * @returns Array of full publication records
 */
export const fetchGroupPublications = async (publicationIds: string[]) => {
  try {
    const { data, error } = await supabase
      .from('publications')
      .select('*, paper_type:paper_types(name), publisher:publishers(name), subject:subjects(name)')
      .in('id', publicationIds);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching group publications:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'فشل جلب المنشورات',
    };
  }
};
