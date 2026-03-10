import { useState } from 'react';
import {
  AutocompleteInput,
  List,
  ListControllerResult,
  ReferenceInput,
  useTranslate,
  useUpdate,
} from 'react-admin';
import {
  Box,
  Chip,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Loading } from 'components/UI';
import { Tables, Enums } from 'types';
import { toArabicNumerals } from 'utils';

const ACADEMIC_YEAR_LABELS: Record<Enums<'academic_years'>, string> = {
  KG0: 'تمهيدي',
  KG1: 'KG1',
  KG2: 'KG2',
  '1st_primary': 'أولى ابتدائي',
  '2nd_primary': 'ثانية ابتدائي',
  '3rd_primary': 'ثالثة ابتدائي',
  '4th_primary': 'رابعة ابتدائي',
  '5th_primary': 'خامسة ابتدائي',
  '6th_primary': 'سادسة ابتدائي',
  '1st_preparatory': 'أولى إعدادي',
  '2nd_preparatory': 'ثانية إعدادي',
  '3rd_preparatory': 'ثالثة إعدادي',
  '1st_secondary': 'أولى ثانوي',
  '2nd_secondary': 'ثانية ثانوي',
  '3rd_secondary': 'ثالثة ثانوي',
};

export const ClientsList = () => {
  const translate = useTranslate();

  const filters = [
    <ReferenceInput
      key="clientFilter"
      source="id"
      reference="users"
      sort={{ field: 'created_at', order: 'DESC' }}
      alwaysOn
    >
      <AutocompleteInput
        sx={{ minWidth: 300 }}
        variant="standard"
        label={translate('custom.labels.client')}
        optionText={(record) => (record ? `${record.full_name} (${record.phone_number})` : '')}
        filterToQuery={(searchText) => {
          if (!searchText) return {};
          const q = `%${searchText.trim()}%`;
          return { or: `(full_name.ilike.${q},phone_number.ilike.${q})` };
        }}
      />
    </ReferenceInput>,
  ];

  return (
    <List
      sort={{ field: 'created_at', order: 'DESC' }}
      filters={filters}
      storeKey={false}
      render={({ isPending, error, data: clients }: ListControllerResult<Tables<'users'>>) => {
        if (isPending) return <Loading />;
        if (error) return <Box>Error: {error.message}</Box>;
        if (!clients?.length)
          return (
            <Typography sx={{ p: 2 }} color="text.secondary">
              لا يوجد عملاء
            </Typography>
          );

        return (
          <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledHeadCell>{translate('resources.users.fields.full_name')}</StyledHeadCell>
                  <StyledHeadCell>
                    {translate('resources.users.fields.phone_number')}
                  </StyledHeadCell>
                  <StyledHeadCell>
                    {translate('resources.users.fields.academic_years')}
                  </StyledHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <ClientRow key={client.id} client={client} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }}
    />
  );
};

const ClientRow = ({ client }: { client: Tables<'users'> }) => {
  const [update] = useUpdate<Tables<'users'>>();
  const [editingField, setEditingField] = useState<'full_name' | 'phone_number' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');

  const PHONE_REGEX = /^01[0125]\d{8}$/;

  const startEdit = (field: 'full_name' | 'phone_number') => {
    setEditingField(field);
    setEditValue(client[field] || '');
    setError('');
  };

  const commitEdit = () => {
    if (!editingField) return;
    const trimmed = editValue.trim();
    if (editingField === 'phone_number' && trimmed && !PHONE_REGEX.test(trimmed)) {
      setError('لا يبدو كرقم هاتف صحيح');
      return;
    }
    if (trimmed && trimmed !== (client[editingField] || '')) {
      update('users', {
        id: client.id,
        data: { [editingField]: trimmed },
        previousData: client,
      });
    }
    setEditingField(null);
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') {
      setEditingField(null);
      setError('');
    }
  };

  const years = client.academic_years as Enums<'academic_years'>[] | null;

  return (
    <TableRow hover>
      <TableCell
        onClick={() => !editingField && startEdit('full_name')}
        sx={{ cursor: 'pointer', minWidth: 180 }}
      >
        {editingField === 'full_name' ? (
          <TextField
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            autoFocus
            size="small"
            variant="standard"
            fullWidth
          />
        ) : (
          <Typography variant="body2">{client.full_name || '—'}</Typography>
        )}
      </TableCell>
      <TableCell
        onClick={() => !editingField && startEdit('phone_number')}
        sx={{ cursor: 'pointer', minWidth: 140 }}
      >
        {editingField === 'phone_number' ? (
          <TextField
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setError('');
            }}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            autoFocus
            size="small"
            variant="standard"
            fullWidth
            error={!!error}
            helperText={error}
          />
        ) : (
          <Typography variant="body2">
            {client.phone_number ? toArabicNumerals(client.phone_number) : '—'}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {years?.length
            ? years.map((y) => <Chip key={y} label={ACADEMIC_YEAR_LABELS[y] || y} size="small" />)
            : '—'}
        </Box>
      </TableCell>
    </TableRow>
  );
};

const StyledHeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.grey[100],
}));
