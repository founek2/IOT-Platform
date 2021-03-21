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
import PropertyRow from "./components/PropertyRow";

const useStyles = makeStyles({
	root: {
		display: "flex",
		flexDirection: "column",
		textAlign: "center",
		height: "100%",
		cursor: "pointer",
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
					<>
						<div
							className={classes.root}
							onClick={(e) => {
								console.log("clicked", e.target);
								setOpenDialog(true);
							}}
						>
							<Typography className={classes.header} onContextMenu={handleOpen}>
								{thing.config.name}
							</Typography>

							{/* <div className={classes.container}>
							{Icon ? <Icon className={classes.icon} /> : null}
							<Typography component="span">
								{value || "??"} {property.unitOfMeasurement}
							</Typography>
						</div> */}
						</div>
						<SimpleDialog
							open={openDialog}
							onClose={() => {
								console.log("closing");
								setOpenDialog(false);
							}}
							title={title}
							deviceId={deviceId}
							thing={thing}
						>
							<div>
								{thing.config.properties.map((property) => (
									<PropertyRow
										key={property.propertyId}
										property={property}
										value={thing.state?.value[property.propertyId]}
										onChange={(newValue) => onClick({ [property.propertyId]: newValue })}
									/>
								))}
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
					</>
				);
			}}
		/>
	);
}

export default boxHoc(Generic);
