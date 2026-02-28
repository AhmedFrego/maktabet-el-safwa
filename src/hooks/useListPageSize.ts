import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'store';
import { setListPageSize } from 'store/slices/uiSlice';
import { useLocation } from 'react-router-dom';

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

/**
 * Custom hook to manage persistent list page size preferences
 * Saves and loads the number of items to display per page for each resource
 * automatically from URL parameters and Redux state
 * @param resourceName - Name of the resource (e.g., 'reservations', 'publications', 'users')
 * @returns Object with { currentPageSize, updatePageSize }
 */
export const useListPageSize = (resourceName: string) => {
  const dispatch = useAppDispatch();
  const listPageSizes = useAppSelector((state) => state.ui.listPageSizes);
  const location = useLocation();

  // Extract perPage from current URL search params
  const urlParams = new URLSearchParams(location.search);
  const urlPerPage = urlParams.get('perPage');
  const urlPageSize = urlPerPage ? parseInt(urlPerPage, 10) : null;

  // Use URL value if present, otherwise use saved preference, otherwise default
  const currentPageSize = urlPageSize ?? listPageSizes[resourceName] ?? DEFAULT_PAGE_SIZE;

  // When URL perPage changes (user changed pagination), save to Redux
  useEffect(() => {
    if (urlPageSize && urlPageSize !== listPageSizes[resourceName]) {
      dispatch(setListPageSize({ resource: resourceName, pageSize: urlPageSize }));
    }
  }, [urlPageSize, resourceName, listPageSizes, dispatch]);

  return currentPageSize;
};

export { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE };
export default useListPageSize;
