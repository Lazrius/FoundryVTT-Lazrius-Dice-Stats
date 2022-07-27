import Logger from "./Utils/Logger";
import PreloadTemplates from "./PreloadTemplates";
import {RegisterSettingsMenu} from "./Menus/SettingsMenu";

Hooks.once("init", async () => {
	RegisterSettingsMenu();
	await PreloadTemplates();
});

Hooks.once("ready", () => {
	Logger.Ok("Ready!");
});