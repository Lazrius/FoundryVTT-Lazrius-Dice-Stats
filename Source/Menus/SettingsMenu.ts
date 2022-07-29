import {TemplatePath} from "../PreloadTemplates";
import {WebClient, WebClientSettings} from "../WebClient";

const settingsKey = "dice-stats";

export const DebugMode = (): boolean => (game as Game).settings.get(settingsKey, "debug") as boolean;
export const AlertOnFailure = (): boolean => (game as Game).settings.get(settingsKey, "alert") as boolean;

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

	g.settings.registerMenu(settingsKey, 'lazrius-dice-stats', {
		name: 'Lazrius Dice Stats Configuration',
		label: 'Configuration',
		hint: 'This is where you can configure settings for Lazrius\' Dice Stats.',
		icon: 'fas fa-dice-d20',
		restricted: true,
		type: DiceStatConfiguration
	});

	const settings: WebClientSettings = {
		secretKey: g.settings.get(settingsKey, 'apiSecret') as string,
		apiUrl: new URL(g.settings.get(settingsKey, 'apiUri') as string)
	};
	WebClient.Reinitialise(settings);
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

		return data;
	}

	protected _updateObject(event: Event, formData: Record<string, unknown> | undefined): Promise<void> {
		if (!formData)
			return Promise.reject();

		Object.entries(formData).forEach(([key, value]) => {
			// Get the old setting value
			const oldValue: any = (game as Game).settings.get(settingsKey, key);

			// Only update the setting if it has been changed (this leaves the default in place if it hasn't been touched)
			if (value !== oldValue) {
				(game as Game).settings.set(settingsKey, key, value);
			}
		});

		const settings: WebClientSettings = {
			secretKey: formData['apiSecret'] as string,
			apiUrl: new URL(formData['apiUri'] as string)
		};
		WebClient.Reinitialise(settings);
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