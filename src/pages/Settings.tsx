import { useStore } from 'react-admin';

import { Tables } from 'types/supabase-generated.types';

export const Settings = () => {
  const [setting] = useStore<Tables<'settings'>>('settings');

  console.log(setting);
  return (
    <></>
    // <Edit>
    //   <SimpleForm>
    //     <TextInput source="id" />
    //     <ArrayInput source="paper_prices">
    //       <SimpleFormIterator>
    //         <TextInput source="id" />
    //         <NumberInput source="oneFacePrice" />
    //         <NumberInput source="twoFacesPrice" />
    //       </SimpleFormIterator>
    //     </ArrayInput>
    //     <TextInput source="current_term" /> <TextInput source="default_paper_size" />
    //     <DateInput source="current_year" /> <NumberInput source="price_ceil_to" />
    //     <TextInput source="branch" />
    //   </SimpleForm>
    // </Edit>
  );
};
