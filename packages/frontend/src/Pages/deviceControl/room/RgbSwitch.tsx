import React, { Fragment, useState } from "react";
import { withStyles, Theme, createStyles } from "@material-ui/core/styles";
import { Content as Switch } from "./Swich";
import MenuItem from "@material-ui/core/MenuItem";
import boxHoc from "./components/boxHoc";
import TuneIcon from "@material-ui/icons/Tune";
import IconButton from "@material-ui/core/IconButton";
import FieldConnector from "framework-ui/lib/Components/FieldConnector";
import { RgbTypes, LINEAR_TYPE } from "common/lib/constants";
import Slider from "./components/Slider";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import ColorPicker from "./components/ColorPicker";
import { validateRegisteredFields, fillForm } from "framework-ui/lib/redux/actions/formsData";
import { getFormData, getFieldVal } from "framework-ui/lib/utils/getters";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

const styles = (theme: Theme) =>
	createStyles({
		button: {
			position: "absolute",
			left: 5,
			top: 3,
		},
		content: {
			display: "flex",
			flexDirection: "column",
			paddingBottom: 16, // same padding as dialogTitle
		},
		colorWrap: {
			width: 196,
			margin: `${theme.spacing(2)}px auto 0`,
		},
		actions: {
			paddingRight: theme.spacing(2),
			paddingLeft: theme.spacing(2),
		},
		loader: {
			position: "absolute",
			margin: "0 auto",
		},
		textField: {
			marginTop: theme.spacing(1),
			marginLeft: 0,
			marginRight: 0,
			width: 200,
			[theme.breakpoints.down("sm")]: {
				width: "100%",
			},
		},
	});

function RgbSwitch({
	classes,
	name,
	description,
	onClick,
	data,
	ackTime,
	afk,
	pending,
	forceUpdate,
	JSONkey,
	id,
	...props
}: any) {
	const [open, setOpen] = useState(false);
	const [colorType, setColorType] = useState<string>(LINEAR_TYPE);
	const { state = { on: 0 } } = data;

	const onClose = () => setOpen(false);

	const changeColor = async (e: React.ChangeEvent<any>) => {
		const newData = { color: e.target.value, on: 1, type: data.type }; // formData are old -> add actual color + add on:1 to turnOn led
		await onClick(newData);
	};

	const changeBright = async (e: React.ChangeEvent<any>) => {
		const newData = { bright: e.target.value, on: 1 }; // formData are old -> add actual color + add on:1 to turnOn led
		await onClick(newData);
	};

	const handleOpen = () => {
		fillForm({ type: state.type, color: state.color, bright: state.bright });
		setOpen(true);
	};

	return (
		<Fragment>
			<Switch
				name={name}
				data={{ state: { on: state.on } }}
				ackTime={ackTime}
				pending={pending}
				afk={afk}
				onClick={() => !afk && !pending && onClick({ on: state.on ? 0 : 1 })}
				{...props}
			/>
			<IconButton size="small" className={classes.button} onClick={handleOpen} disabled={afk}>
				<TuneIcon className={classes.icon} />
			</IconButton>

			<Dialog
				open={open}
				onClose={onClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">Změna nastavení</DialogTitle>
				<DialogContent className={classes.content}>
					<FieldConnector
						deepPath="EDIT_RGB.bright"
						className={classes.textField}
						component={Slider}
						onChange={changeBright}
					/>
					<FieldConnector
						component="Select"
						deepPath="EDIT_RGB.type"
						className={classes.textField}
						onChange={(e) => setColorType(e.target.value)}
						selectOptions={RgbTypes.map(({ value, label }) => (
							<MenuItem value={value} key={value}>
								{label}
							</MenuItem>
						))}
					/>
					{LINEAR_TYPE === colorType ? (
						<FieldConnector
							deepPath="EDIT_RGB.color"
							component={ColorPicker as any}
							onChange={changeColor}
						/>
					) : null}
				</DialogContent>
			</Dialog>
		</Fragment>
	);
}

// export default boxHoc(withStyles(styles)(RgbSwitch));

// const _mapStateToProps = (state: any) => ({
//     formData: getFormData("EDIT_RGB")(state),
//     colorType: getFieldVal("EDIT_RGB.type")(state)
// })

// const _mapDispatchToProps = (dispatch: any) =>
//     bindActionCreators(
//         {
//             validateForm: validateRegisteredFields("EDIT_RGB"),
//             fillForm: fillForm("EDIT_RGB")
//         },
//         dispatch
//     )

// export default boxHoc(connect(_mapStateToProps, _mapDispatchToProps)(component))