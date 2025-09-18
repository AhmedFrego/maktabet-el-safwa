import { Menu as RAMenu } from 'react-admin';

import { DonutLarge } from '@mui/icons-material';

export const Menu = () => (
  <RAMenu>
    <RAMenu.Item to="/" primaryText="البيانات" leftIcon={<DonutLarge />} />

    <RAMenu.ResourceItem name="notes" />
  </RAMenu>
);
