import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import { NotfyTypeForDataType, NotifyType, NotifyTypeText } from 'common/lib/models/interface/notifyInterface';
import { IThing, IThingProperty, IThingPropertyEnum, PropertyDataType } from 'common/lib/models/interface/thing';
import { isNumericDataType } from 'common/lib/utils/isNumericDataType';
import FieldConnector from 'framework-ui/lib/Components/FieldConnector';
import { formsDataActions } from 'framework-ui/lib/redux/actions/formsData';
import { getFieldVal } from 'framework-ui/lib/utils/getters';
import { RootState } from 'frontend/src/store/store';
import React, { Fragment } from 'react';
import { connect, useDispatch } from 'react-redux';

interface PropertyPartProps {
    id: number;
    config: IThing['config'];
    selectedProperty?: IThingProperty;
    selectedType?: NotifyType;
}

function PropertyPart({ id, config, selectedProperty, selectedType }: PropertyPartProps) {
    const isEnum = selectedProperty ? selectedProperty.dataType === PropertyDataType.enum : false;
    const isNumerical = selectedProperty ? isNumericDataType(selectedProperty.dataType) : false;
    const dispatch = useDispatch();

    function updateFormField(deepPath: string, value: any) {
        dispatch(formsDataActions.setFormField({ deepPath, value }));
    }

    return (
        <Fragment>
            <Grid item md={4} xs={12}>
                <FieldConnector
                    component="Select"
                    deepPath={`EDIT_NOTIFY.propertyId.${id}`}
                    fieldProps={{
                        fullWidth: true,
                    }}
                    selectOptions={config.properties.map(({ name, propertyId }) => (
                        <MenuItem value={propertyId} key={propertyId}>
                            {name}
                        </MenuItem>
                    ))}
                    onChange={() => {
                        updateFormField(`EDIT_NOTIFY.type.${id}`, '');
                        updateFormField(`EDIT_NOTIFY.value.${id}`, '');
                    }}
                />
            </Grid>
            {selectedProperty ? (
                <Fragment>
                    <Grid item md={4} xs={12}>
                        <FieldConnector
                            component="Select"
                            deepPath={`EDIT_NOTIFY.type.${id}`}
                            fieldProps={{
                                fullWidth: true,
                            }}
                            onChange={() => {
                                updateFormField(`EDIT_NOTIFY.value.${id}`, '');
                            }}
                            // selectOptions={NotifyControlTypes[selectedJSONkey].map(({ value, label }) => (
                            // 	<MenuItem value={value} key={value}>
                            // 		{label}
                            // 	</MenuItem>
                            // ))}
                            selectOptions={Object.values(NotfyTypeForDataType[selectedProperty.dataType]).map(
                                (value) => (
                                    <MenuItem value={value} key={value}>
                                        {NotifyTypeText[value]}
                                    </MenuItem>
                                )
                            )}
                        />
                    </Grid>
                    {selectedType && selectedType !== NotifyType.always ? (
                        <Grid item md={4} xs={12}>
                            <FieldConnector
                                component={isEnum ? 'Select' : 'TextField'}
                                deepPath={`EDIT_NOTIFY.value.${id}`}
                                fieldProps={{
                                    fullWidth: true,
                                    type: isNumerical ? 'number' : 'text',
                                }}
                                selectOptions={
                                    isEnum
                                        ? (selectedProperty as IThingPropertyEnum).format.map((label) => (
                                              <MenuItem value={label} key={label}>
                                                  {label}
                                              </MenuItem>
                                          ))
                                        : undefined
                                }
                                // selectOptions={selectedProperty?.format.map((value) => (
                                // 	<MenuItem value={value} key={value}>
                                // 		{value}
                                // 	</MenuItem>
                                // ))}
                            />
                        </Grid>
                    ) : null}
                </Fragment>
            ) : null}
            {/* <FieldConnector
                deepPath={`EDIT_NOTIFY.value.${id}`}
            /> */}
        </Fragment>
    );
}

const _mapStateToProps = (state: RootState, { id, config }: { id: number; config: IThing['config'] }) => {
    const selectedPropId = getFieldVal(`EDIT_NOTIFY.propertyId.${id}`, state) as
        | IThingProperty['propertyId']
        | undefined;

    const selectedProperty: IThingProperty | undefined = selectedPropId
        ? config.properties.find(({ propertyId }) => propertyId === selectedPropId)
        : undefined;

    return {
        selectedProperty,
        selectedType: getFieldVal(`EDIT_NOTIFY.type.${id}`, state) as NotifyType | undefined,
    };
};

export default connect(_mapStateToProps)(PropertyPart);
