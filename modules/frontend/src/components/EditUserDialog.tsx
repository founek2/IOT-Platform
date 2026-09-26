import React, { useState } from "react";
import { logger } from 'common/logger';
import { useEffect } from 'react';
import { Dialog } from '../components/Dialog.js';
import EditUserForm from '../components/EditUserForm.js';
import { User } from '../endpoints/signIn.js';
import { EditUserFormData, useUpdateUserMutation, useUsersQuery } from '../endpoints/users.js';
import { useForm } from '../hooks/useForm.js';
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAppSelector } from "../hooks/index.js";
import { getCurrentUser, getUsers } from "../selectors/getters.js";
import { usersSelectors } from "../store/slices/application/usersSlice.js";

export default function EditUserDialog() {
    const [selectedUser, setSelectedUser] = useState<User>()
    const [searchParams] = useSearchParams();
    const currentUser = useAppSelector(getCurrentUser)
    const users = useAppSelector(getUsers);
    // const users:User[] = []
    const navigate = useNavigate()
    const editUserParam: "current" | string | undefined = searchParams.get("editUser") || undefined

    const { validateForm, resetForm, setFormData } = useForm<EditUserFormData>('EDIT_USER');
    const [updateUserMutation, { isLoading }] = useUpdateUserMutation();


    useEffect(() => {
        if (editUserParam === "current") {
            setSelectedUser(currentUser)
        } else if (editUserParam) {
            const user = users.find(user => user._id === editUserParam)
            setSelectedUser(user)
        } else setSelectedUser(undefined)
    }, [editUserParam])

    useEffect(() => {
        if (selectedUser)
            setFormData({
                info: {
                    userName: selectedUser.info.userName,
                    email: selectedUser.info.email,
                    firstName: selectedUser.info.firstName,
                    lastName: selectedUser.info.lastName,
                },
                groups: selectedUser.groups,
            });

        return () => resetForm();
    }, [selectedUser, resetForm]);

    function onClose() {
        navigate({ search: "" }, { replace: true })
    }

    async function handleEdit() {
        const result = validateForm();
        if (!result.valid || !selectedUser) return;

        updateUserMutation({ userId: selectedUser._id, data: result.data })
            .unwrap()
            .then(onClose)
            .catch((err) => { logger.error(err) });
    }

    return <Dialog
        open={Boolean(selectedUser)}
        onClose={onClose}
        onAgree={handleEdit}
        agreeText="Uložit"
        disabled={isLoading}
    >
        <EditUserForm formName="EDIT_USER" editGroups />
    </Dialog>


}
