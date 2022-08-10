import {WebClient} from "../WebClient";
import {GetWorldId} from "../Utils";
import {AxiosError} from "axios";
import HttpStatusCode from "../Models/HttpStatusCode";
import {TemplatePath} from "../PreloadTemplates";

const CurrentWorldData = () => (
	{
		name: (game as Game).world.data.title as string,
		system: (game as Game).world.data.system as string,
		worldId: (game as Game).world.id as string,
	}
);

export class WorldSetupMenu extends FormApplication {
	constructor() {
		super({});
	}

	getData(): any {
		const data = super.getData() as any;
		return { ...data, ...CurrentWorldData() };
	}

	static get defaultOptions(): FormApplicationOptions {
		return {
			...super.defaultOptions,
			title: 'Lazrius\' Dice Stats Configuration',
			id: "dice-stats-config",
			template: TemplatePath() + "dice-stats-world-setup.hbs",
			width: 650,
			height: 275
		};
	}

	_render(force?: boolean, options?: Application.RenderOptions<FormApplicationOptions>): Promise<void> {
		const res = super._render(force, options);

		WebClient.GetWorldInformation(GetWorldId())
		.then(res => {
			$('#ds-loader-world-setup').css('display', 'none');
			$('#ds-form-world-setup').css('display', '');
			$('#ds-world-id').val(res.id);
			$('#ds-world-name').val(res.name);
			$('#ds-world-system').val(res.system);
			$('#ds-world-update-button').prop('disabled', false);
		})
		.catch((err: AxiosError) => {
			if (err.response && err.response.status === HttpStatusCode.BAD_REQUEST) {
				$('#ds-loader-world-setup').css('display', 'none');
				$('#ds-form-world-setup').css('display', '');
				$('#ds-world-setup-button').prop('disabled', false);
			} else {
				console.error(err);
				ui.notifications?.error(`Dice Stats: Unable to get world information. See console.`);
				return this.close();
			}
		});

		return res;
	}

	protected _updateObject(event: Event, formData?: Record<string, unknown>): Promise<void> {
		if (!formData)
			return Promise.resolve();

		const method = formData.setup ? WebClient.CreateWorld : WebClient.UpdateWorld;
		method(CurrentWorldData())
		.then((res) => {
			if (!res.name)
				res.name = CurrentWorldData().name;

			ui.notifications?.info(`Dice Stats: World (${res.name}) data ${formData.setup ? 'Created' : 'Updated'}`);

		}).catch(err => {
			console.error(err);
			ui.notifications?.error(`Dice Stats: There were errors in making changes to the current world. See Console.`);
		});

		return Promise.resolve();
	}
}