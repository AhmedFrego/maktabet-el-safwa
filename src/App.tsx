import { Admin, Resource, CustomRoutes } from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

import { CacheProvider } from '@emotion/react';
import { darkTheme, lightTheme, rtlCache } from './theme';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';

import {
  CreateGuesser,
  EditGuesser,
  ForgotPasswordPage,
  LoginPage,
  SetPasswordPage,
  ShowGuesser,
  defaultI18nProvider,
  supabaseDataProvider,
  supabaseAuthProvider,
} from 'ra-supabase';

import { NoteList } from 'pages/notes';
import { MergedDatabase } from 'types';

const instanceUrl = import.meta.env.VITE_SUPABASE_URL;
const apiKey = import.meta.env.VITE_SUPABASE_API_KEY;
const supabaseClient = createClient<MergedDatabase>(instanceUrl, apiKey);
const dataProvider = supabaseDataProvider({
  instanceUrl,
  apiKey,
  supabaseClient,
});
const authProvider = supabaseAuthProvider(supabaseClient, {});

document.documentElement.dir = 'rtl';
document.documentElement.lang = 'ar';

export const App = () => (
  <BrowserRouter>
    <CacheProvider value={rtlCache}>
      <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        i18nProvider={defaultI18nProvider}
        loginPage={LoginPage}
        theme={lightTheme}
        darkTheme={darkTheme}
      >
        <Resource
          icon={DocumentScannerIcon}
          options={{ label: 'مذكرات' }}
          name="notes"
          list={NoteList}
          edit={EditGuesser}
          create={CreateGuesser}
          show={ShowGuesser}
        />

        <CustomRoutes noLayout>
          <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
          <Route path={ForgotPasswordPage.path} element={<ForgotPasswordPage />} />
        </CustomRoutes>
      </Admin>
    </CacheProvider>
  </BrowserRouter>
);
