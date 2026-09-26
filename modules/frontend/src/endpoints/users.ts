import { IDevice } from 'common/models/interface/device';
import { api } from './api.js';
import { SignInResponse, User } from './signIn.js';

export interface RegisterUserForm {
    info: {
        userName: string;
        firstName?: string;
        lastName?: string;
        email: string;
    };
    auth: {
        password: string;
    };
}

export interface EditUserFormData {
    info: {
        userName: string;
        firstName?: string;
        lastName?: string;
        email: string;
    };
    auth?: {
        password: string;
    };
    groups: string[];
}

type userNamesResponse = { data: { _id: string; userName: string }[] };
export const usersApi = api.injectEndpoints({
    endpoints: (build) => ({
        userNames: build.query<userNamesResponse['data'], undefined>({
            query: () => `main/user?type=userName`,
            providesTags: ['UserNames'],
            transformResponse: (res: userNamesResponse) => res.data,
        }),
        registerAndSignIn: build.mutation<SignInResponse, RegisterUserForm>({
            query: (data) => ({
                url: 'main/user',
                method: 'POST',
                body: { formData: { REGISTRATION: data } },
            }),
        }),
        register: build.mutation<undefined, RegisterUserForm>({
            query: (data) => ({
                url: 'main/user',
                method: 'POST',
                body: { formData: { REGISTRATION: data } },
            }),
        }),
        users: build.query<User[], undefined>({
            query: () => `main/user`,
            providesTags: ['Users'],
            transformResponse: (res: { docs: User[] }) => res.docs,
        }),
        updateUser: build.mutation<undefined, { userId: string; data: EditUserFormData }>({
            query: ({ userId, data }) => ({
                url: `main/user/${userId}`,
                method: 'PUT',
                body: { formData: { EDIT_USER: data } },
            }),
            invalidatesTags: ['Users'],
        }),
    }),
});

export const {
    useUserNamesQuery,
    useRegisterAndSignInMutation,
    useRegisterMutation,
    useUsersQuery,
    useUpdateUserMutation,
} = usersApi;
