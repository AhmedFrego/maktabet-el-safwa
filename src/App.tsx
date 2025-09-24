import { Admin, CustomRoutes, Resource } from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';
import { ForgotPasswordPage, LoginPage, SetPasswordPage } from 'ra-supabase';
import polyglotI18nProvider from 'ra-i18n-polyglot';

import { CacheProvider } from '@emotion/react';
import { darkTheme, lightTheme, rtlCache } from 'theme';

import { store } from 'store';
import { Provider } from 'react-redux';

import { Layout } from 'components/layout';
import { Dashboard, NotFound } from 'pages';
import { myProvider as dataProvider, authProvider } from 'lib';
import { arabicMessages } from 'utils';

import { NoteResource } from 'resources/notes';
import { reservationsResource } from 'resources/reservations';

const i18nProvider = polyglotI18nProvider(() => arabicMessages, 'ar');

document.documentElement.dir = 'rtl';
document.documentElement.lang = 'ar';

export const App = () => (
  <BrowserRouter>
    <CacheProvider value={rtlCache}>
      <Provider store={store}>
        <Admin
          dataProvider={dataProvider}
          authProvider={authProvider}
          i18nProvider={i18nProvider}
          loginPage={LoginPage}
          theme={lightTheme}
          darkTheme={darkTheme}
          layout={Layout}
          dashboard={Dashboard}
          catchAll={NotFound}
        >
          <Resource {...NoteResource} />
          <Resource {...reservationsResource} />

          <CustomRoutes noLayout>
            <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
            <Route path={ForgotPasswordPage.path} element={<ForgotPasswordPage />} />
          </CustomRoutes>
        </Admin>
      </Provider>
    </CacheProvider>
  </BrowserRouter>
);
