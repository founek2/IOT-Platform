import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles } from '@material-ui/core/styles';
import Loader from 'framework-ui/src/Components/Loader';
import { userActions } from 'framework-ui/src/redux/actions/application/user';
import { formsDataActions } from 'framework-ui/src/redux/actions/formsData';
import { History } from 'history';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm from '../components/UserForm';
import { useAppDispatch } from '../hooks';

const useClasses = makeStyles((theme) => ({
    card: {
        overflow: 'auto',
        margin: '0px auto',
        position: 'relative',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 470,
        marginTop: 0,

        [theme.breakpoints.down('sm')]: {
            width: '100%',
            //height: '100%'
        },
        [theme.breakpoints.down('xs')]: {
            width: '100%',
        },
        [theme.breakpoints.up('lg')]: {
            //height: 410
        },
    },
    actions: {
        marginBottom: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            marginTop: theme.spacing(2),
        },
        margin: 'auto',
        width: 400,
        justifyContent: 'center',

        [theme.breakpoints.down('sm')]: {
            width: '100%',
            justifyContent: 'flex-start',
            flexDirection: 'column',
        },
    },
    header: {
        paddingBottom: 0,
        paddingTop: theme.spacing(4),
        textAlign: 'center',
    },
    content: {
        paddingLeft: 30,
        paddingRight: 30,
    },
}));

function RegisterUser() {
    const [pending, setPending] = useState(false);
    const [autoLogin, setAutoLogin] = useState(true);
    const classes = useClasses();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleRegister = async () => {
        setPending(true);
        const action = autoLogin
            ? () => dispatch(userActions.registerAngLogin())
            : () => dispatch(userActions.register());
        const success = await action();
        if (autoLogin && success) navigate('/');
        if (success) dispatch(formsDataActions.removeForm('REGISTRATION'));

        setPending(false);
    };

    return (
        <Card className={classes.card}>
            <CardHeader className={classes.header} title="Registrace" />
            <CardContent className={classes.content}>
                <UserForm formName="REGISTRATION" onEnter={handleRegister} />
            </CardContent>
            <CardActions className={classes.actions}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={autoLogin}
                            onChange={(e) => setAutoLogin(e.target.checked)}
                            value="checkedB"
                            color="default"
                        />
                    }
                    label="Po registraci přihlásit"
                />
                <Button color="primary" variant="contained" onClick={handleRegister} disabled={pending}>
                    Registrovat
                </Button>
                <Loader open={pending} />
            </CardActions>
        </Card>
    );
}

export default RegisterUser;
