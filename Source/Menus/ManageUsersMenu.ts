import {TemplatePath} from "../PreloadTemplates";
import {WebClient} from "../WebClient";
import {CheckErrorForValidWorld} from "./SettingsMenu";
import ChangeEvent = JQuery.ChangeEvent;
import {AxiosError} from "axios";

interface MiniUserResponse {
	id: string,
	isDm: boolean,
	created: number,
	name: string
}

export class ManageUsersMenu extends FormApplication {
	constructor() {
		super({});

		(game as Game).users?.forEach(x => {
			this.userMap.set(x.id, null);
		});
	}

	private userMap: Map<string, MiniUserResponse | null> = new Map<string, MiniUserResponse | null>();
	private userId = '';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected _updateObject(event: Event, formData?: Record<string, unknown> | undefined): Promise<void> {
		return Promise.resolve();
	}

	getData(options?: Partial<FormApplicationOptions>): any {
		return {
			...super.getData(options),
			users: (game as Game).users?.contents,
		}
	}

	public render(force?: boolean, options?: Application.RenderOptions<FormApplicationOptions>): unknown {
		const res = super.render(force, options);

		WebClient.GetAllUsers()
		.then((res) => {
			res.users.forEach(x => {
				if (this.userMap.has(x.id)) {
					this.userMap.set(x.id, x);
				}
			});

			$('#ds-form-user-manager').css('display', '');
			$('#ds-loader-user-manager').css('display', 'none');
		})
		.catch(async (err: string) => {
			if (!CheckErrorForValidWorld(err)) {
				ui.notifications?.error('Dice Stats: Unable to get user data. See console for information.');
			}
			await this.close();
		})

		return res;
	}

	activateListeners(html: JQuery): void {
		super.activateListeners(html);

		$('#ds-user-select').on('change', (event: ChangeEvent) => {
			const el = $(event.currentTarget);
			const val = el.val() as string;
			if (el.prop('disabled') || !this.userMap.has(val))
				return;

			const user = this.userMap.get(val);
			this.userId = val;
			if (!user) {
				$('#ds-user-setup-button').prop('disabled', false);
				$('#ds-user-id').val('This user has not been setup.');
				$('#ds-user-name').val('This user has not been setup.');
				$('#ds-user-isDm').prop('checked', false);
			} else {
				$('#ds-user-id').val(user.id);
				$('#ds-user-name').val(user.name);
				$('#ds-user-isDm').prop('checked', user.isDm);
				$('#ds-user-setup-button').prop('disabled', true);
			}
		});

		$('#ds-user-setup-button').on('click', () => this.userSetup());
	}

	userSetup(): void {
		if (!this.userId)
			return;
		
		$('#ds-user-setup-button').prop('disabled', true);
		
		const user = (game as Game).users?.find(x => x.id == this.userId);
		if (!user) {
			ui.notifications?.error('Dice Stats: Invalid user Id');
			return;
		}
		
		WebClient.CreateUser({
			userId: user.id,
			isDm: user.isGM,
			name: user.name as string
		})
		.then((res) => {
			this.userMap.delete(res.id);
			this.userMap.set(res.id, {
				id: res.id,
				created: res.created,
				name: res.name,
				isDm: res.isDm
			});
			ui.notifications?.info('Dice Stats: User created.');
			$('#ds-user-select').trigger('change');
		})
		.catch((err: AxiosError) => {
			console.error(err);
			ui.notifications?.error('Dice Stats: Unable to create user. See Console.');
		})
	}

	static get defaultOptions(): FormApplicationOptions {
		const options = super.defaultOptions;
		options.title = 'Manage Users';
		options.id = "ds-manage-user-menu";
		options.template = TemplatePath() + 'dice-stats-user-manager.hbs';
		options.closeOnSubmit = false;
		options.popOut = true;
		options.width = 600;
		options.height = 250;
		return options;
	}
}