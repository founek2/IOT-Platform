import { getUser } from 'framework-ui/lib/utils/getters';
import React from 'react';
import { useSelector } from 'react-redux';
import EditUser from '../userManagement/EditUser';
import { userActions } from 'framework-ui/lib/redux/actions/application/user';
import { useAppDispatch } from 'frontend/src/hooks';
import { RootState } from 'frontend/src/store/store';
import { IUser } from 'common/lib/models/interface/userInterface';
import { useHistory } from 'react-router';

function Account() {
    const user = useSelector<RootState, IUser | null>(getUser);
    const dispatch = useAppDispatch();
    const history = useHistory();

    if (!user) return <p>Načítám data...</p>;
    return (
        <EditUser
            onButtonClick={async () => {
                const ok = await dispatch(userActions.updateUser(user._id));
                if (ok) history.goBack();
            }}
            user={user}
        />
    );
}

export default Account;
