import { Pagination } from 'react-admin';
import { Box, MenuItem, Select, Typography } from '@mui/material';

const ROW_OPTIONS = [1, 2, 3, 4, 5, 6];

interface GridPaginationProps {
  rows: number;
  onRowsChange: (rows: number) => void;
}

export const GridPagination = ({ rows, onRowsChange }: GridPaginationProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2 }}>
      <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
        عدد الصفوف
      </Typography>
      <Select
        size="small"
        value={rows}
        onChange={(e) => onRowsChange(Number(e.target.value))}
        sx={{ minWidth: 60 }}
      >
        {ROW_OPTIONS.map((n) => (
          <MenuItem key={n} value={n}>
            {n}
          </MenuItem>
        ))}
      </Select>
    </Box>
    <Pagination
      sx={{
        flex: 1,
        '& .MuiTablePagination-input': { display: 'none' },
        '& .MuiTablePagination-selectLabel': { display: 'none' },
      }}
    />
  </Box>
);
