import Globals from "../Globals";
import {SessionDialog} from "../Controllers/SessionController";
import {ManageUsersMenu} from "../Menus/ManageUsersMenu";
import {ManagePartyMembersMenu} from "../Menus/ManagePartyMembersMenu";
import {WorldSetupMenu} from "../Menus/WorldSetupMenu";
import {AddLayerHotbar, UpdateWebClient} from "../Menus/SettingsMenu";
import Logger from "../Utils/Logger";

export const GetSceneControlButtons = (controls: SceneControl[]): void => {
	if (!AddLayerHotbar()) {
		Logger.Warn('Suppressing adding of hotbar - disabled in config.');
		return;
	}

	const forceConnectionRefresh = {
		icon: "fas fa-network-wired",
		name: "ds-force-connection-refresh",
		title: "Force DB Connection Refresh",
		onClick: () => UpdateWebClient(true),
		visible: true,
		button: true,
	};

	const sessionController = {
		icon: "fas fa-step-forward",
		name: "ds-session-controller",
		title: "Start / End Session",
		onClick: SessionDialog,
		visible: true,
		button: true,
	};

	const manageWorld = {
		icon: "fas fa-globe",
		name: "ds-world-controller",
		title: "Manage World",
		visible: true,
		button: true,
		onClick: () => new WorldSetupMenu().render(true),
	}

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
		name: "ds-member-controller",
		title: "Manage Party Members",
		visible: true,
		button: true,
		onClick: () => new ManagePartyMembersMenu().render(true),
	};

	controls.push({
		name: Globals.ModuleName,
		title: "Dice Stats Controls",
		icon: "fas fa-chart-bar",
		layer: 'dice-stats',
		visible: true,
		activeTool: "ds-session-controller",
		tools: [
			forceConnectionRefresh,
			sessionController,
			manageWorld,
			manageUsers,
			managePartyMembers
		]
	})
}