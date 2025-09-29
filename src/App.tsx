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
import { settingsResource } from 'resources/settings';
import { BranchSelector } from 'components';
import { PropsWithChildren } from 'react';
import { ReservationCreate } from 'resources/reservations/reaservation-create';

const i18nProvider = polyglotI18nProvider(() => arabicMessages, 'ar');

document.documentElement.dir = 'rtl';
document.documentElement.lang = 'ar';

const CustomLayout = ({ children }: PropsWithChildren) => (
  <>
    <BranchSelector /> <ReservationCreate />
    <Layout>{children}</Layout>
  </>
);

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
          layout={CustomLayout}
          dashboard={Dashboard}
          catchAll={NotFound}
        >
          <Resource {...NoteResource} />
          <Resource {...reservationsResource} />
          <Resource {...settingsResource} />

          <CustomRoutes noLayout>
            <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
            <Route path={ForgotPasswordPage.path} element={<ForgotPasswordPage />} />
          </CustomRoutes>
        </Admin>
      </Provider>
    </CacheProvider>
  </BrowserRouter>
);
