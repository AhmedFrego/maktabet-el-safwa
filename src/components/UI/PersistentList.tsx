import { List, ListProps } from 'react-admin';
import { useListPageSize } from 'hooks';

interface PersistentListProps extends Omit<ListProps, 'perPage'> {
  resourceName: string;
  perPage?: number; // Optional override, defaults to saved preference
}

/**
 * React Admin List wrapper that persists user's chosen page size preference
 * Automatically saves/loads the number of items to display per page for each resource
 *
 * Usage:
 * ```tsx
 * export const PublicationList = () => (
 *   <PersistentList resourceName="publications">
 *     <Datagrid>
 *       <TextField source="title" label="الاسم" />
 *     </Datagrid>
 *   </PersistentList>
 * );
 * ```
 */
export const PersistentList = ({
  resourceName,
  perPage: overridePerPage,
  ...props
}: PersistentListProps) => {
  // Hook automatically watches URL params and saves to Redux
  const savedPageSize = useListPageSize(resourceName);

  // Use override if provided, otherwise use saved preference
  const effectivePerPage = overridePerPage ?? savedPageSize;

  return <List {...props} perPage={effectivePerPage} />;
};

export default PersistentList;
