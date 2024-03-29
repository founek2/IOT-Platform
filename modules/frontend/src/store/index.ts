import { CombinedState, configureStore, isRejectedWithValue, Middleware } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import { api } from '../endpoints/api';
import rootReducer from './slices';
import { notificationActions } from './slices/notificationSlice';
import { $CombinedState } from '@reduxjs/toolkit';
import errorMessages from 'common/src/localization/error';
import { authorizationActions } from './slices/application/authorizationActions';
import { logger } from 'common/src/logger';

export const rtkQueryErrorLogger: Middleware =
    ({ dispatch }) =>
        (next) =>
            (action) => {
                // RTK Query uses `createAsyncThunk` from redux-toolkit under the hood, so we're able to utilize these matchers!
                if (isRejectedWithValue(action)) {
                    console.error(action)
                    // console.warn('We got a rejected action!');
                    //   toast.warn({ title: 'Async error!', message: action.error.data.message })
                    if (action.payload?.data?.error === 'disabledToken') {
                        dispatch(authorizationActions.signOut() as any);
                        dispatch(notificationActions.add({ message: errorMessages.getMessage("invalidToken"), options: { variant: 'warning' } }))
                    } else if (action?.payload?.data?.error) {
                        dispatch(
                            notificationActions.add({
                                message: errorMessages.getMessage(action.payload.data.error),
                                options: { variant: 'error' },
                            })
                        );
                    } else {
                        dispatch(notificationActions.add({ message: 'Nastala chyba', options: { variant: 'error' } }))
                    };
                }

                return next(action);
            };

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, notificationActions.add.type, notificationActions.set.type],
            },
        })
            .concat(api.middleware)
            .concat(rtkQueryErrorLogger),
});

// Hot reload support
if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./slices', () => store.replaceReducer(rootReducer));
}

export type AppStore = typeof store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
