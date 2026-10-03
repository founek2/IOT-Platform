import { IUserDashboard } from 'common/models/interface/userInterface';
import { api } from './api.js';

export const userDashboardApi = api.injectEndpoints({
    endpoints: (build) => ({
        userDashboard: build.query<IUserDashboard, string>({
            query: (userId) => `main/user/${userId}/preferences`,
            providesTags: ['UserDashboard'],
            transformResponse: (res: { dashboard: IUserDashboard }) => res.dashboard,
        }),
        updateUserDashboard: build.mutation<undefined, { userId: string; data: IUserDashboard }>({
            query: ({ userId, data }) => ({
                url: `main/user/${userId}/preferences`,
                method: 'POST',
                body: { formData: { USER_DASHBOARD: data } },
            }),
            invalidatesTags: ['UserDashboard'],
        }),
    }),
});

export const { useUserDashboardQuery, useUpdateUserDashboardMutation } = userDashboardApi;
