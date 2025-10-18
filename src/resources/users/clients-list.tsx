import { Avatar } from '@mui/material';
import { DataTable, DateField, List } from 'react-admin';
import { toArabicNumerals } from 'utils';

export const ClientsList = () => (
  <List>
    <DataTable>
      <DataTable.Col
        source="avatar_url"
        render={(record) =>
          record.avatar_url ? (
            toArabicNumerals(record.avatar_url)
          ) : (
            <Avatar {...stringAvatar(record.full_name)} />
          )
        }
      />
      <DataTable.Col source="full_name" />
      <DataTable.Col
        source="phone_number"
        render={(record) => (record.phone_number ? toArabicNumerals(record.phone_number) : 'N/A')}
      />
      <DataTable.Col source="email" />
      <DataTable.Col source="role" />
      <DataTable.Col source="academic_years" />
    </DataTable>
  </List>
);

const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
};

const stringAvatar = (name: string) => {
  const parts = name.trim().split(' ');
  const initials =
    parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : `${parts[0][0]} ${parts[0][1] || ''}`; // fallback to first two letters with space

  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: initials.toUpperCase(),
  };
};
