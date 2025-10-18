import { PropsWithChildren } from 'react';
import { Admin, CustomRoutes, Resource } from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';
import { ForgotPasswordPage, LoginPage, SetPasswordPage } from 'ra-supabase';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import { CacheProvider } from '@emotion/react';
import { Provider } from 'react-redux';

import { BranchSelector } from 'components';
import { Layout } from 'components/layout';
import { myProvider as dataProvider, authProvider } from 'lib';
import { Dashboard, NotFound, Settings } from 'pages';
import { store } from 'store';
import { darkTheme, lightTheme, rtlCache } from 'theme';
import { arabicMessages } from 'utils';

import { PublicationResource } from 'resources/publications';
import { reservationsResource } from 'resources/reservations';
import { ReservationCreate } from 'resources/reservations/reaservation-create';
import { clientsResource } from 'resources/users';

const i18nProvider = polyglotI18nProvider(() => arabicMessages, 'ar');

document.documentElement.dir = 'rtl';
document.documentElement.lang = 'ar';

const CustomLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <BranchSelector /> <ReservationCreate />
      <Layout>{children}</Layout>
    </>
  );
};

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
          <Resource {...PublicationResource} />
          <Resource {...reservationsResource} />
          <Resource {...clientsResource} options={{ route: 'clients' }} />

          <CustomRoutes noLayout>
            <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
            <Route path={ForgotPasswordPage.path} element={<ForgotPasswordPage />} />
          </CustomRoutes>
          <CustomRoutes>
            <Route path={'settings'} element={<Settings />} />
          </CustomRoutes>
        </Admin>
      </Provider>
    </CacheProvider>
  </BrowserRouter>
);
