import { supabase } from 'lib/supabase';
import { TablesUpdate } from 'types';

/**
 * Utility functions for managing bidirectional related publications links.
 * When publication A is linked to B, B is automatically linked to A.
 */

/**
 * Add bidirectional links between a publication and its related publications.
 * Updates both the source publication and all target publications.
 *
 * @param publicationId - The ID of the publication being edited
 * @param relatedIds - Array of publication IDs to link to
 * @returns Promise resolving when all updates complete
 */
export const syncAddRelated = async (
  publicationId: string,
  relatedIds: string[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (relatedIds.length === 0) {
      return { success: true };
    }

    // Fetch current related_publications for all involved publications
    const allIds = [publicationId, ...relatedIds];
    const { data: publications, error: fetchError } = await supabase
      .from('publications')
      .select('id, related_publications')
      .in('id', allIds);

    if (fetchError) throw fetchError;
    if (!publications) throw new Error('Failed to fetch publications');

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
