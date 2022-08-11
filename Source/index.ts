import Logger from "./Utils/Logger";
import PreloadTemplates from "./PreloadTemplates";
import {RegisterSettingsMenu} from "./Menus/SettingsMenu";
import {GetSceneControlButtons} from "./Hooks/GetSceneControlButtons";
import {RegisterLayer} from "./Menus/DiceStatsLayer";
import {WebClient} from "./WebClient";
import {OnChatMessageRender} from "./Hooks/OnChatMessageRender";

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
		Logger.Ok("Ready. Testing current configuration connectivity.");
		const settings = WebClient.GetCurrentSettings();
		if (settings.connectionSuccessful) {
			Logger.Ok('Connection successful - Getting session data.');
			WebClient.GetCurrentSession();
		}
	});

	Hooks.on('getSceneControlButtons', GetSceneControlButtons);
	Hooks.on('renderChatMessage', OnChatMessageRender);
});