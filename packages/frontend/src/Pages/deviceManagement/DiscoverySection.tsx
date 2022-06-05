import { Fab, Grid, useTheme, useMediaQuery } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { DeviceStatus } from 'common/src/models/interface/device';
import { IDiscovery, IDiscoveryThing } from 'common/src/models/interface/discovery';
import Dialog from 'framework-ui/src/Components/Dialog';
import FieldConnector from 'framework-ui/src/Components/FieldConnector';
import EnchancedTable from 'framework-ui/src/Components/Table';
import { formsDataActions } from 'framework-ui/src/redux/actions/formsData';
import { isUrlHash } from 'framework-ui/src/utils/getters';
import { DeviceForm } from 'frontend/src/components/DeviceForm';
import { assoc, prop } from 'ramda';
import React, { Fragment, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import OnlineCircle from '../../components/OnlineCircle';
import { discoveryActions } from '../../store/actions/application/discovery';
import { useManagementStyles } from 'frontend/src/hooks/useManagementStyles';
import { Locations } from 'frontend/src/types';

interface DiscoverySectionProps {
    discoveredDevices?: IDiscovery[];
    addDiscoveryAction: any;
    deleteDiscoveryAction: any;
    locations: Locations;
}

function DiscoverySection({
    discoveredDevices,
    addDiscoveryAction,
    deleteDiscoveryAction,
    locations,
}: DiscoverySectionProps) {
    const classes = useManagementStyles();
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [selectedId, setSelectedId] = useState<null | string>(null);
    const dispatch = useDispatch();
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('xs'));

    function closeDialog() {
        dispatch(formsDataActions.removeForm('CREATE_DEVICE'));
        setOpenAddDialog(false);
    }

    async function onAgree() {
        const result = await addDiscoveryAction(selectedId);
        if (result) closeDialog();
    }

    return (
        <Fragment>
            {discoveredDevices && discoveredDevices?.length > 0 && (
                <FieldConnector
                    deepPath="DISCOVERY_DEVICES.selected"
                    component={({ onChange, value }) => (
                        <EnchancedTable
                            customClasses={{
                                tableWrapper: classes.tableWrapper,
                                toolbar: classes.toolbar,
                                pagination: classes.pagination,
                            }}
                            rowsPerPageOptions={[2, 5, 10, 25]}
                            rowsPerPage={2}
                            // @ts-ignore
                            dataProps={[
                                { path: 'name', label: 'Název' },
                                { path: 'deviceId', label: 'ID zařízení' },
                                {
                                    path: 'things',
                                    label: 'Věcí',
                                    convertor: (things: { [nodeId: string]: IDiscoveryThing } = {}) =>
                                        Object.values(things)
                                            .map((obj) => obj.config.name)
                                            .join(', '),
                                },
                                {
                                    path: 'createdAt',
                                    label: 'Vytvořeno',
                                    convertor: (date: string) => new Date(date).toLocaleDateString(),
                                },
                                {
                                    path: 'state.status',
                                    label: 'Status',
                                    convertor: (status: { value: DeviceStatus; timestamp: Date }) => (
                                        <OnlineCircle status={status} inTransition={false} />
                                    ),
                                },
                            ]}
                            data={discoveredDevices.map((device: any) => assoc('id', prop('_id', device), device))}
                            toolbarHead="Přidání zařízení"
                            onDelete={deleteDiscoveryAction}
                            orderBy="name"
                            // enableCreation={isAdmin}
                            //onAdd={() => this.updateCreateForm({ open: true })}
                            enableEdit
                            customEditButton={(id: string, item: IDiscovery) => (
                                <Fab
                                    color="primary"
                                    aria-label="add"
                                    size="small"
                                    disabled={item.state?.status.value !== DeviceStatus.ready}
                                    onClick={() => {
                                        setSelectedId(id);
                                        dispatch(
                                            formsDataActions.setFormField({
                                                deepPath: 'CREATE_DEVICE.info.name',
                                                value: discoveredDevices.find((dev) => dev._id === id)?.name || '',
                                            })
                                        );
                                        setOpenAddDialog(true);
                                    }}
                                >
                                    <AddIcon />
                                </Fab>
                            )}
                            onChange={onChange}
                            value={value}
                        />
                    )}
                />
            )}
            <Dialog
                open={openAddDialog}
                title="Přidání zařízení"
                cancelText="Zrušit"
                agreeText="Přidat"
                onAgree={onAgree}
                onClose={closeDialog}
                fullScreen={isSmall}
                content={
                    <Grid container spacing={2}>
                        <DeviceForm formName="CREATE_DEVICE" onEnter={onAgree} locations={locations} />
                    </Grid>
                }
            />
        </Fragment>
    );
}

const _mapStateToProps = (state: any) => {
    return {
        openAddDialog: isUrlHash('#addDevice')(state),
    };
};

const _mapDispatchToProps = (dispatch: any) =>
    bindActionCreators(
        {
            deleteDiscoveryAction: discoveryActions.deleteDevices,
            addDiscoveryAction: discoveryActions.addDevice,
            // resetCreateDeviceAction: formsActions.removeForm('CREATE_DEVICE'),
            // updateFormField: formsActions.updateFormField,
        },
        dispatch
    );

export default connect(_mapStateToProps, _mapDispatchToProps)(DiscoverySection);
