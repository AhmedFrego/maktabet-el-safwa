import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from 'lib';
import { Enums, idName } from 'types';

type Term = Enums<'term'>;
type PublicationType = Enums<'publications_types'>;

/** The lightweight row shape returned by our filter-options query. */
interface FilterRow {
  academic_year: Enums<'academic_years'>;
  subject_id: string;
  publisher_id: string;
  year: string;
  subjects: idName;
  publishers: idName;
}

/** Filters that constrain the *universe* of publications we derive options from. */
interface BaseFilters {
  term?: string;
  year?: string;
  publication_type?: string;
  or?: string; // showGrouped OR clause
}

/** Cascading filter keys – selecting one narrows the others. */
interface CascadingSelection {
  academic_year?: string;
  subject_id?: string;
  publisher_id?: string;
}

export interface PublicationFilterOptions {
  availableAcademicYears: Enums<'academic_years'>[];
  availableSubjects: idName[];
  availablePublishers: idName[];
  availableYears: string[];
  isLoading: boolean;
}

/**
 * Fetches ALL publications (lightweight columns only – no pagination) directly
 * from Supabase and derives cascading filter options client-side.
 *
 * Base filters (term, year, publication_type, showGrouped OR clause) constrain the
 * universe of publications. Cascading selections (academic_year, subject_id,
 * publisher_id) narrow each other's available options.
 */
export const usePublicationFilterOptions = (
  filterValues: Record<string, unknown>
): PublicationFilterOptions => {
  const [rows, setRows] = useState<FilterRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Separate base filters (trigger re-fetch) from cascading ones (client-side only)
  const base: BaseFilters = {
    term: filterValues.term as string | undefined,
    year: filterValues.year as string | undefined,
    publication_type: filterValues.publication_type as string | undefined,
    or: filterValues.or as string | undefined,
  };

  const cascading: CascadingSelection = {
    academic_year: filterValues.academic_year as string | undefined,
    subject_id: filterValues.subject_id as string | undefined,
    publisher_id: filterValues.publisher_id as string | undefined,
  };

  // Stable key to detect base-filter changes without unnecessary re-fetches
  const baseKey = JSON.stringify(base);
  const prevBaseKey = useRef(baseKey);

  useEffect(() => {
    let cancelled = false;

    const fetchOptions = async () => {
      // Only show loading spinner on initial load or when base filters change
      if (prevBaseKey.current !== baseKey) {
        setIsLoading(true);
        prevBaseKey.current = baseKey;
      }

      let query = supabase
        .from('publications')
        .select(
          'academic_year, subject_id, publisher_id, year, subjects:subjects(id,name), publishers:publishers(id,name)'
        );

      // Apply base constraints
      if (base.term) query = query.eq('term', base.term as Term);
      if (base.year) query = query.eq('year', base.year);
      if (base.publication_type)
        query = query.eq('publication_type', base.publication_type as PublicationType);
      if (base.or) {
        const sanitizedOr = base.or.replace(/^\(+|\)+$/g, '');
        query = query.or(sanitizedOr);
      }

      const { data, error } = await query;

      if (!cancelled) {
        if (error) {
          console.error('❌ Error fetching filter options:', error);
          setRows([]);
        } else {
          setRows((data as unknown as FilterRow[]) ?? []);
        }
        setIsLoading(false);
      }
    };

    fetchOptions();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseKey]);

  // ── Cascading derivation ──────────────────────────────────────────────
  // Each dropdown's options are derived from rows that match the OTHER
  // two cascading selections, so picking academic_year narrows subjects &
  // publishers, and vice-versa.

  const availableAcademicYears = useMemo(() => {
    let filtered = rows;
    if (cascading.subject_id)
      filtered = filtered.filter((r) => r.subject_id === cascading.subject_id);
    if (cascading.publisher_id)
      filtered = filtered.filter((r) => r.publisher_id === cascading.publisher_id);
    return [...new Set(filtered.map((r) => r.academic_year))];
  }, [rows, cascading.subject_id, cascading.publisher_id]);

  const availableSubjects = useMemo(() => {
    let filtered = rows;
    if (cascading.academic_year)
      filtered = filtered.filter((r) => r.academic_year === cascading.academic_year);
    if (cascading.publisher_id)
      filtered = filtered.filter((r) => r.publisher_id === cascading.publisher_id);
    return [...new Map(filtered.map((r) => [r.subjects.id, r.subjects])).values()];
  }, [rows, cascading.academic_year, cascading.publisher_id]);

  const availablePublishers = useMemo(() => {
    let filtered = rows;
    if (cascading.academic_year)
      filtered = filtered.filter((r) => r.academic_year === cascading.academic_year);
    if (cascading.subject_id)
      filtered = filtered.filter((r) => r.subject_id === cascading.subject_id);
    return [...new Map(filtered.map((r) => [r.publishers.id, r.publishers])).values()];
  }, [rows, cascading.academic_year, cascading.subject_id]);

  const availableYears = useMemo(() => {
    return [...new Set(rows.map((r) => r.year))];
  }, [rows]);

  return {
    availableAcademicYears,
    availableSubjects,
    availablePublishers,
    availableYears,
    isLoading,
  };
};
