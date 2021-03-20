import React, { useEffect, useMemo } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import boxHoc from "./components/boxHoc";
import ControlContextMenu from "./components/ControlContextMenu";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";
import { PropertyClass, IThing, IThingProperty } from "common/lib/models/interface/thing";
import { SensorIcons } from "../../../components/SensorIcons";
import { SimpleDialog } from "./components/Dialog";
import ChartSimple from "frontend/src/components/ChartSimple";
import { useSelector } from "react-redux";
import { getThingHistory } from "../../../utils/getters";
import { IState } from "frontend/src/types";
import { BoxWidgetProps } from "./components/BorderBox";
import { HistoricalSensor } from "common/lib/models/interface/history";
import clsx from "clsx";
import UpdatedBefore from "framework-ui/lib/Components/UpdatedBefore";

const useStyles = makeStyles({
	root: {
		display: "flex",
		flexDirection: "column",
		textAlign: "center",
	},
	header: {
		height: "1.7em",
		overflow: "hidden",
		userSelect: "none",
		marginBottom: 15,
	},
	circle: {
		top: 3,
		right: 3,
		position: "absolute",
	},
	container: {
		fontSize: 25,
		display: "flex",
		justifyContent: "center",
	},
	icon: {
		marginRight: 5,
	},
	graphTitle: {
		marginBottom: 10,
	},
	updatedBefore: {
		textAlign: "center",
		marginBottom: 10,
	},
});

function Generic({ onClick, deviceId, thing, room, fetchHistory }: BoxWidgetProps) {
	const classes = useStyles();
	const [openDialog, setOpenDialog] = React.useState(false);
	const title = room + " - " + thing.config.name!;

	useEffect(() => {
		if (openDialog) fetchHistory();
	}, [openDialog]);

	return (
		<ControlContextMenu
			name={thing.config.name}
			// JSONkey={JSONkey}
			render={({ handleOpen }: any) => {
				return (
					<div className={classes.root}>
						<Typography
							className={classes.header}
							onContextMenu={handleOpen}
							onClick={() => setOpenDialog(true)}
						>
							{thing.config.name}
						</Typography>

						{/* <div className={classes.container}>
							{Icon ? <Icon className={classes.icon} /> : null}
							<Typography component="span">
								{value || "??"} {property.unitOfMeasurement}
							</Typography>
						</div> */}
						<SimpleDialog
							open={openDialog}
							onClose={() => setOpenDialog(false)}
							title={title}
							deviceId={deviceId}
							thing={thing}
						>
							<div>
								{thing.config.properties.map(
									({ unitOfMeasurement, propertyId, propertyClass, name, settable }) => {
										const Icon = propertyClass ? SensorIcons[propertyClass] : null;
										console.log("tady", room, name);
										const units = unitOfMeasurement ? " " + unitOfMeasurement : "";
										const value = thing.state?.value[propertyId]
											? thing.state?.value[propertyId]
											: "[Chybí hodnota]";
										return (
											<div className={clsx(classes.container, classes.graphTitle)}>
												{Icon ? <Icon className={classes.icon} /> : null}
												<Typography component="span">{name}</Typography>
												{value}
												<Typography>{units}</Typography>
											</div>
										);
									}
								)}
							</div>
							{thing.state?.timestamp ? (
								<UpdatedBefore
									time={new Date(thing.state.timestamp)}
									variant="body2"
									prefix="Aktualizováno před"
									className={classes.updatedBefore}
								/>
							) : null}
						</SimpleDialog>
					</div>
				);
			}}
		/>
	);
}

export default boxHoc(Generic);
