import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import { NotfyTypeForDataType, NotifyType, NotifyTypeText } from 'common/src/models/interface/notifyInterface';
import { IThing, IThingProperty, IThingPropertyEnum, PropertyDataType } from 'common/src/models/interface/thing';
import { getFieldVal } from 'common/src/utils/getters';
import { isNumericDataType } from 'common/src/utils/isNumericDataType';
import React, { Fragment } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import FieldConnector from '../../../components/FieldConnector';
import { formsDataActions } from '../../../store/slices/formDataActions';

interface PropertyPartProps {
    id: number;
    config: IThing['config'];
    selectedProperty?: IThingProperty;
    selectedType?: NotifyType;
}

function PropertyPart({ id, config }: PropertyPartProps) {
    const selectedPropId = useAppSelector<string | undefined>(getFieldVal(`EDIT_NOTIFY.propertyId.${id}`));
    const selectedProperty: IThingProperty | undefined = selectedPropId
        ? config.properties.find(({ propertyId }) => propertyId === selectedPropId)
        : undefined;
    const isEnum = selectedProperty ? selectedProperty.dataType === PropertyDataType.enum : false;
    const isNumerical = selectedProperty ? isNumericDataType(selectedProperty.dataType) : false;
    const dispatch = useDispatch();
    const selectedType = useAppSelector<NotifyType | undefined>(getFieldVal(`EDIT_NOTIFY.type.${id}`));

    function updateFormField(deepPath: string, value: any) {
        dispatch(formsDataActions.setFormField({ deepPath, value }));
    }

    return (
        <Fragment>
            <Grid size={{ md: 4, xs: 12 }}>
                <FieldConnector
                    component="Select"
                    deepPath={`EDIT_NOTIFY.propertyId.${id}`}
                    fullWidth
                    options={config.properties.map(({ name, propertyId }) => (
                        { label: name, value: propertyId }
                    ))}
                    onChange={() => {
                        updateFormField(`EDIT_NOTIFY.type.${id}`, '');
                        updateFormField(`EDIT_NOTIFY.value.${id}`, '');
                    }}
                />
            </Grid>
            {selectedProperty ? (
                <Fragment>
                    <Grid size={{ md: 4, xs: 12 }}>
                        <FieldConnector
                            component="Select"
                            deepPath={`EDIT_NOTIFY.type.${id}`}
                            fullWidth
                            onChange={() => {
                                updateFormField(`EDIT_NOTIFY.value.${id}`, '');
                            }}
                            options={Object.values(NotfyTypeForDataType[selectedProperty.dataType]).map(
                                (value) => (
                                    { label: NotifyTypeText[value], value }
                                )
                            )}
                        />
                    </Grid>
                    {selectedType && selectedType !== NotifyType.always ? (
                        <Grid size={{ md: 4, xs: 12 }}>
                            {isEnum ? <FieldConnector
                                component='Select'
                                deepPath={`EDIT_NOTIFY.value.${id}`}
                                fullWidth
                                fieldProps={{
                                    type: isNumerical ? 'number' : 'text',
                                }}
                                options={(selectedProperty as IThingPropertyEnum).format.map((label) => (
                                    { label, value: label }
                                ))
                                }
                            /> : <FieldConnector
                                component='TextField'
                                deepPath={`EDIT_NOTIFY.value.${id}`}
                                fullWidth
                                fieldProps={{
                                    type: isNumerical ? 'number' : 'text',
                                }}
                            />}

                        </Grid>
                    ) : null}
                </Fragment>
            ) : null}
            <Grid size={{ xs: 12 }}>
                <FieldConnector
                    deepPath={`EDIT_NOTIFY.textTemplate.${id}`}
                    fullWidth
                />
            </Grid>
        </Fragment>
    );
}

export default PropertyPart;
