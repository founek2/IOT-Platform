import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    DialogContentText,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { logger } from 'common/src/logger';
import React, { useState } from 'react';
import { Dialog } from '../../components/Dialog';
import {
    NewAccessTokenData,
    useAccessTokensQuery,
    useCreateAccessTokenMutation,
    useDeleteAccessTokenMutation,
    useUpdateAccessTokenMutation,
} from '../../endpoints/accessTokens';
import { useAppSelector } from '../../hooks';
import { useForm } from '../../hooks/useForm';
import { getCurrentUser } from '../../selectors/getters';
import EditAccessToken from './accessTokens/EditAccessToken';
import { SecurityLoader } from './Security.loader';

enum OpenDialog {
    Delete,
    Create,
    Edit,
}

function AccessTokens() {
    const createForm = useForm<NewAccessTokenData>('ADD_ACCESS_TOKEN');
    const editForm = useForm<NewAccessTokenData>('EDIT_ACCESS_TOKEN');
    const [apiToken, setApiToken] = useState<string>();
    const user = useAppSelector(getCurrentUser);
    const { data: accessTokens, isLoading } = useAccessTokensQuery({ userID: user?._id! }, { skip: !user?._id });
    const [deleteMutation] = useDeleteAccessTokenMutation();
    const [createMutation] = useCreateAccessTokenMutation();
    const [updateMutation] = useUpdateAccessTokenMutation();
    const [openDialog, setOpenDialog] = useState<{ type: OpenDialog; id: string }>();

    async function createToken() {
        const { data, valid } = createForm.validateForm();
        if (!valid) return;

        try {
            const res = (await createMutation({ userID: user?._id!, data }).unwrap()) as any;
            setApiToken(res.doc.token);
            setOpenDialog(undefined);
            createForm.resetForm();
        } catch (err) {
            logger.error(err);
        }
    }

    async function editToken() {
        const { data, valid } = editForm.validateForm();
        if (!valid) return;

        try {
            await updateMutation({ userID: user?._id!, tokenID: openDialog?.id!, data }).unwrap();
            setOpenDialog(undefined);
            editForm.resetForm();
        } catch (err) {
            logger.error(err);
        }
    }

    function clearApiToken() {
        setApiToken(undefined);
    }

    if (isLoading) return <SecurityLoader />;

    return (
        <>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }} display="flex" justifyContent="center">
                    <Button onClick={() => setOpenDialog({ type: OpenDialog.Create, id: '' })} variant="contained">
                        Vytvořit token
                    </Button>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Název</TableCell>
                                    <TableCell align="right">Oprávnění</TableCell>
                                    <TableCell align="right">Vytvořeno</TableCell>
                                    <TableCell align="right">Akce</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {accessTokens?.map((row) => (
                                    <TableRow key={row._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="right">{row.permissions.join(', ')}</TableCell>
                                        <TableCell align="right">
                                            {new Date(row.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                onClick={() => {
                                                    setOpenDialog({ type: OpenDialog.Delete, id: row._id });
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => setOpenDialog({ type: OpenDialog.Edit, id: row._id })}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
            <Dialog
                open={openDialog?.type === OpenDialog.Create}
                title="Vytvoření tokenu"
                disagreeText="Zrušit"
                agreeText="Uložit"
                onAgree={createToken}
                onClose={() => setOpenDialog(undefined)}
            >
                <EditAccessToken formName="ADD_ACCESS_TOKEN" />
            </Dialog>
            <Dialog
                open={openDialog?.type === OpenDialog.Edit}
                title="Editace tokenu"
                disagreeText="Zrušit"
                agreeText="Uložit"
                onAgree={() => {
                    editToken();
                }}
                onClose={() => setOpenDialog(undefined)}
            >
                <EditAccessToken
                    formName="EDIT_ACCESS_TOKEN"
                    accessToken={accessTokens?.find((token) => token._id === openDialog?.id)}
                />
            </Dialog>
            <Dialog
                open={openDialog?.type === OpenDialog.Delete}
                title="Opravdu chcete přístupový token odstranit?"
                onClose={() => setOpenDialog(undefined)}
                disagreeText="Zrušit"
                onAgree={async () => {
                    try {
                        await deleteMutation({ userID: user?._id!, tokenID: openDialog?.id! });
                        setOpenDialog(undefined);
                    } catch (err) {
                        logger.error(err);
                    }
                }}
            >
                <DialogContentText>
                    Tato akce je nevratná a pokud máte token někde použitý, tak ztratíte přístup.
                </DialogContentText>
            </Dialog>
            <Dialog
                open={Boolean(apiToken)}
                title="Přístupový token pro API"
                agreeText="Zavřít"
                onAgree={clearApiToken}
                onClose={clearApiToken}
            >
                <DialogContentText>
                    Váš token: <Typography fontWeight={900}>{apiToken}</Typography> Uložte si ho, protože po zavření
                    tohoto okna již jej nebude možné zobrazit.
                </DialogContentText>
            </Dialog>
        </>
    );
}

export default AccessTokens;
