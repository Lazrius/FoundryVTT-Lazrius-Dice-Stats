import Globals from "../Globals";
import {SessionDialog} from "../Controllers/SessionController";
import {ManageUsersMenu} from "../Menus/ManageUsersMenu";

export const GetSceneControlButtons = (controls: SceneControl[]): void => {
	const sessionController = {
		icon: "fas fa-step-forward",
		name: "ds-session-controller",
		title: "Start / End Session",
		onClick: SessionDialog,
		visible: true,
		button: true,
	};

	const manageUsers = {
		icon: "fas fa-users",
		name: "ds-user-controller",
		title: "Manage Users",
		visible: true,
		button: true,
		onClick: () => new ManageUsersMenu().render(true),
	};

	const managePartyMembers = {
		icon: "fas fa-address-card",
		name: "ds-user-controller",
		title: "Manage Party Members",
		visible: true,
		button: true,
		onClick: () => new ManageUsersMenu().render(true),
	};

	controls.push({
		name: Globals.ModuleName,
		title: "Dice Stats Controls",
		icon: "fas fa-chart-bar",
		layer: 'dice-stats',
		visible: true,
		activeTool: "ds-session-controller",
		tools: [
			sessionController,
			manageUsers,
			managePartyMembers
		]
	})
}