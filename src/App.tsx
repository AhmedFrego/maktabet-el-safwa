import { Admin, CustomRoutes, Resource } from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

import { CacheProvider } from '@emotion/react';
import { darkTheme, lightTheme, rtlCache } from './theme';

import {
  ForgotPasswordPage,
  LoginPage,
  SetPasswordPage,
  defaultI18nProvider,
  supabaseDataProvider,
  supabaseAuthProvider,
} from 'ra-supabase';

import { MergedDatabase } from 'types';
import { Dashboard, NotFound } from 'pages';

import { NoteResource } from 'resources/notes';
import { Layout } from 'components/layout';

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
        layout={Layout}
        dashboard={Dashboard}
        catchAll={NotFound}
      >
        <Resource {...NoteResource} />

        <CustomRoutes noLayout>
          <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
          <Route path={ForgotPasswordPage.path} element={<ForgotPasswordPage />} />
        </CustomRoutes>
      </Admin>
    </CacheProvider>
  </BrowserRouter>
);
