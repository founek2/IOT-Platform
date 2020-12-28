import React, { Fragment, Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import IconButton from '@material-ui/core/IconButton'
import AddCircle from '@material-ui/icons/AddCircle'
import { connect } from 'react-redux'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Button from '@material-ui/core/Button'
import Loader from 'framework-ui/lib/Components/Loader'
import Divider from '@material-ui/core/Divider'
import { bindActionCreators } from 'redux'
import { clone } from 'ramda'
import MenuItem from '@material-ui/core/MenuItem'

import FieldConnector from 'framework-ui/lib/Components/FieldConnector'
import * as deviceActions from '../../store/actions/application/devices'
import { getFormData } from 'framework-ui/lib/utils/getters'
import * as formsActions from 'framework-ui/lib/redux/actions/formsData'
import { SampleIntervals } from 'common/lib/constants'
import EditSensor from './editSensorsForm/EditSensor'
import Typography from '@material-ui/core/Typography';
import { transformSensorsForForm } from 'common/lib/utils/transform'

const styles = theme => ({
    textField: {
        width: 200,
        [theme.breakpoints.down('sm')]: {
            width: '80%'
        }
    },
    unit: {
        width: 100,
        [theme.breakpoints.down('sm')]: {
            width: '80%'
        }
    },
    fileLoader: {
        width: '100%',
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        [theme.breakpoints.down('sm')]: {
            width: '80%'
        }
    },
    card: {
        overflow: 'auto',
        margin: '0px auto',
        position: 'relative',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 650,
        marginTop: 0,

        [theme.breakpoints.down('sm')]: {
            width: '100%'
            //height: '100%'
        },
        [theme.breakpoints.down('xs')]: {
            width: '100%'
        },
        [theme.breakpoints.up('lg')]: {
            //height: 410
        }
    },
    actions: {
        marginBottom: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            marginTop: theme.spacing(2)
        },
        margin: 'auto',
        width: 400,
        justifyContent: 'center',

        [theme.breakpoints.down('sm')]: {
            width: '100%',
            justifyContent: 'flex-start',
            flexDirection: 'column'
        }
    },
    header: {
        paddingBottom: 0,
        paddingTop: theme.spacing(4),
        textAlign: 'center'
    },
    content: {
        paddingLeft: theme.spacing(6),
        paddingRight: theme.spacing(6),
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
            textAlign: 'center',
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
        }
    },

})

class EditDeviceDialog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            pending: false,
            errorOpen: true,
            filled: false,
        }
        const { device, updateSensorCount } = this.props
        updateSensorCount(0); // init
        this.preFillForm(device)
        // TODO uložení nového formuláře a reload -> zobrazí se původní data, ne nová
    }

    preFillForm = device => {
        if (device.sensors && device.sensors.recipe) {
            const { fillEditFormAction } = this.props;
            fillEditFormAction(transformSensorsForForm(device.sensors.recipe, device.sensors.sampleInterval))
        }
    }

    setPending = b => this.setState({ pending: b })

    removeSensorByIndex = id => {
        const { sensorCount, editForm, fillEditFormAction } = this.props;

        const newEditForm = clone(editForm);
        for (let i = id + 1; i < sensorCount; i++) {
            if (newEditForm.name) newEditForm.name[i - 1] = editForm.name[i];
            if (newEditForm.unit) newEditForm.unit[i - 1] = editForm.unit[i];
            if (newEditForm.description) newEditForm.description[i - 1] = editForm.description[i];
            if (newEditForm.JSONkey) newEditForm.JSONkey[i - 1] = editForm.JSONkey[i];
        }
        if (newEditForm.name && id < newEditForm.name.length) newEditForm.name.pop();
        if (newEditForm.unit && id < newEditForm.unit.length) newEditForm.unit.pop();
        if (newEditForm.description && id < newEditForm.description.length) newEditForm.description.pop();
        if (newEditForm.JSONkey && id < newEditForm.JSONkey.length) newEditForm.JSONkey.pop();
        newEditForm.count = sensorCount - 1;
        fillEditFormAction(newEditForm)
    }

    render() {
        const { classes, updateSensorCount, device, sensorCount } = this.props
        const { pending } = this.state
        const handleSave = async () => {
            this.setPending(true)
            await this.props.updateSensorsAction(device.id)
            this.setPending(false)
        }

        return device ? (
            <Fragment>
                <Card className={classes.card}>
                    <CardHeader className={classes.header} title={device.info.title} titleTypographyProps={{ variant: "h3" }} />
                    <CardContent className={classes.content}>
                        <FieldConnector
                            component="Select"
                            deepPath="EDIT_SENSORS.sampleInterval"
                            selectOptions={SampleIntervals
                                .map(
                                    ({ value, label }) =>
                                        (<MenuItem value={value} key={value}>
                                            {label}
                                        </MenuItem>)
                                )}
                        />
                        <Divider />
                        <div>
                            <Typography variant="subtitle1" align="center" >Senzory:</Typography>
                            {sensorCount > 0 && [...Array(sensorCount).keys()].map(i => <EditSensor id={i} key={i} onDelete={this.removeSensorByIndex} />)}

                        </div>
                        <IconButton className={classes.addButton} aria-label="Add a sensor" onClick={() => updateSensorCount(sensorCount + 1)}>
                            <AddCircle className={classes.addIcon} />
                        </IconButton>
                    </CardContent>
                    <CardActions className={classes.actions}>
                        <Button
                            color="primary"
                            variant="contained"
                            className={classes.button}
                            onClick={handleSave}
                            disabled={pending}
                        >
                            Uložit
                              </Button>
                        <Loader open={pending} />
                    </CardActions>
                </Card>
            </Fragment>
        ) : (
                <div />
            ) // redux is faster than closing -> before close is device undefined
    }
}

const _mapStateToProps = state => {
    const editForm = getFormData("EDIT_SENSORS")(state);
    const sensorCount = editForm ? editForm.count : 0;
    return {
        sensorCount,
        editForm,
    }
}

const _mapDispatchToProps = dispatch => (
    {
        ...bindActionCreators(
            {
                updateSensorCount: formsActions.updateFormField("EDIT_SENSORS.count"),
                fillEditFormAction: formsActions.fillForm('EDIT_SENSORS'),
                updateSensorsAction: deviceActions.updateSensors,
            },
            dispatch,
        ),
    })

export default connect(
    _mapStateToProps,
    _mapDispatchToProps
)(withStyles(styles)(EditDeviceDialog))