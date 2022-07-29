import Logger from "./Utils/Logger";
import PreloadTemplates from "./PreloadTemplates";
import {RegisterSettingsMenu} from "./Menus/SettingsMenu";
import {GetSceneControlButtons} from "./Hooks/GetSceneControlButtons";
import {RegisterLayer} from "./Menus/DiceStatsLayer";

Hooks.once("init", async () => {
	const g = game as Game;
	const user = g.data.users?.find(x => x._id === g.userId);
	if (user?.role !== 4) {
		Logger.Warn('Current active user is not a GM. Terminating.');
		return;
	}

	RegisterSettingsMenu();
	await PreloadTemplates();
	RegisterLayer();

	// Hooks
	Hooks.once("ready", () => {
		Logger.Ok("Ready!");
	});

	Hooks.on('getSceneControlButtons', GetSceneControlButtons);
});