import React, { Suspense, useCallback, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { Background } from './components/Background.js';
import EditUserDialog from './components/EditUserDialog.js';
import { MenuAppBar } from './components/MenuAppBar.js';
import { NotificationReduxConnect } from './containers/NotificationReduxConnect.js';
import { RegisterServiceWorker } from './containers/RegisterServiceWorker.js';
import MyRoutes from './containers/Routes.js';
import { MyThemeProvider } from './containers/ThemeProvider.js';
import WebSocket from './containers/WebSocket.js';
import { AppBarContext, AppBarContextType, defaultAppBarCtx } from './hooks/useAppBarContext.js';
import { persistor, store } from './store/index.js';

function App() {
    const [appBarData, setAppBarData] = useState<AppBarContextType['data']>(defaultAppBarCtx.data);
    const setData = useCallback(
        (text: string, Icon?: JSX.Element) => setAppBarData([text, Icon || null]),
        [setAppBarData]
    );
    const resetData = useCallback(() => setAppBarData(defaultAppBarCtx.data), [setAppBarData]);

    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <MyThemeProvider>
                    <SnackbarProvider maxSnack={3}>
                        <NotificationReduxConnect />
                        <RegisterServiceWorker />
                        <BrowserRouter>
                            <AppBarContext.Provider
                                value={{ data: appBarData, setAppHeader: setData, resetAppHeader: resetData }}
                            >
                                <MenuAppBar />
                                <Background>
                                    <Suspense fallback={<CircularProgress />}>
                                        <MyRoutes />
                                    </Suspense>
                                </Background>
                                <EditUserDialog />
                            </AppBarContext.Provider>
                            <WebSocket />
                        </BrowserRouter>
                    </SnackbarProvider>
                </MyThemeProvider>
            </PersistGate>
        </Provider>
    );
}

export default App;
