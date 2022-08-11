import {TemplatePath} from "../PreloadTemplates";
import {WebClient, WebClientSettings} from "../WebClient";
import {WorldSetupMenu} from "./WorldSetupMenu";
import {ManageUsersMenu} from "./ManageUsersMenu";
import {ManagePartyMembersMenu} from "./ManagePartyMembersMenu";

const settingsKey = "dice-stats";

export const DebugMode = (): boolean => (game as Game).settings.get(settingsKey, "debug") as boolean;
export const AlertOnFailure = (): boolean => (game as Game).settings.get(settingsKey, "alert") as boolean;
export const AddLayerHotbar = (): boolean => (game as Game).settings.get(settingsKey, "addLayerHotbar") as boolean;
export const RequireFlavourText = (): boolean => (game as Game).settings.get(settingsKey, "requireFlavourText") as boolean;

export const CheckErrorForValidWorld = (err: string): boolean => {
	if (err.includes('no valid world')) {
		ui.notifications?.error('This world hsa not been setup with the Dice Stats backend API yet. Set it up in the settings menu.');
		return true;
	}

	return false;
}

export const UpdateWebClient = (alert: boolean): void => {
	const settings: WebClientSettings = {
		secretKey: (game as Game).settings.get(settingsKey, 'apiSecret') as string,
		apiUrl: new URL((game as Game).settings.get(settingsKey, 'apiUri') as string),
		sessionActive: false,
		connectionSuccessful: false,
	};
	WebClient.Reinitialise(settings, alert || DebugMode());
}

export const RegisterSettingsMenu = (): void => {
	const g = game as Game;

	g.settings.register(settingsKey, "debug", {
		scope: "client",
		config: false,
		type: Boolean,
		default: false
	});

	g.settings.register(settingsKey, "alert", {
		scope: "client",
		config: false,
		type: Boolean,
		default: false
	});

	g.settings.register(settingsKey, "apiUri", {
		scope: "client",
		config: false,
		type: String,
		default: 'http://localhost:3000'
	});

	g.settings.register(settingsKey, "apiSecret", {
		scope: "client",
		config: false,
		type: String,
		default: ''
	});

	g.settings.register(settingsKey, 'addLayerHotbar', {
		scope: "client",
		config: false,
		type: Boolean,
		default: true
	});

	g.settings.register(settingsKey, 'requireFlavourText', {
		scope: "client",
		config: false,
		type: Boolean,
		default: false
	});

	g.settings.registerMenu(settingsKey, 'lazrius-dice-stats', {
		name: 'Lazrius Dice Stats Configuration',
		label: 'Configuration',
		hint: 'This is where you can configure settings for Lazrius\' Dice Stats.',
		icon: 'fas fa-dice-d20',
		restricted: true,
		type: DiceStatConfiguration
	});

	g.settings.registerMenu(settingsKey, 'lazrius-world-setup', {
		name: 'Dice Stats World Setup',
		label: 'World Setup',
		hint: 'This is where you control ',
		icon: 'fas fa-wrench',
		restricted: true,
		type: WorldSetupMenu
	});

	g.settings.registerMenu(settingsKey, 'lazrius-user-management', {
		name: 'Dice Stats User Setup',
		label: 'User Setup',
		hint: 'This is where you setup users for your game.',
		icon: 'fas fa-users',
		restricted: true,
		type: ManageUsersMenu
	});

	g.settings.registerMenu(settingsKey, 'lazrius-member-management', {
		name: 'Dice Stats Party Member Setup',
		label: 'Member Setup',
		hint: 'This is where you assign party members to your users.',
		icon: 'fas fa-address-card',
		restricted: true,
		type: ManagePartyMembersMenu
	});

	UpdateWebClient(false);
};

class DiceStatConfiguration extends FormApplication {
	constructor() {
		super({});
	}

	public getData() {
		const data = super.getData() as any;

		data.apiUri = (game as Game).settings.get(settingsKey, 'apiUri');
		data.apiSecret = (game as Game).settings.get(settingsKey, 'apiSecret');
		data.debugMode = (game as Game).settings.get(settingsKey, 'debug') as boolean || false;
		data.alertOnError = (game as Game).settings.get(settingsKey, 'alert') as boolean || false;
		data.addLayerHotbar = (game as Game).settings.get(settingsKey, 'addLayerHotbar') as boolean || false;
		data.requireFlavourText = (game as Game).settings.get(settingsKey, 'requireFlavourText') as boolean || false;

		return data;
	}

	protected _updateObject(event: Event, formData: Record<string, unknown> | undefined): Promise<void> {
		if (!formData)
			return Promise.reject();

		for (const key of Object.keys(formData)) {
			(game as Game).settings.set(settingsKey, key, formData[key]);
		}

		UpdateWebClient(true);
		return Promise.resolve();
	}

	static get defaultOptions() {
		const options = {
			...super.defaultOptions,
			title: 'Lazrius\' Dice Stats Configuration',
			id: "dice-stats-config",
			template: TemplatePath() + "dice-stats-config.hbs",
			width: 650
		};
		// Typescript gets angry if this is in the main body for reasons I cannot fathom
		options.height = "auto";
		return options;
	}
}