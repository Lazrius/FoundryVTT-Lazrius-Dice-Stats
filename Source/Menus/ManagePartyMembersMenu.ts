/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Logger from "../Utils/Logger";
import {TemplatePath} from "../PreloadTemplates";
import {WebClient} from "../WebClient";
import {CheckErrorForValidWorld} from "./SettingsMenu";
import {AllUsersResponse} from "../Models/Responses";
import {AxiosError} from "axios";

export class ManagePartyMembersMenu extends FormApplication {
	constructor() {
		super({});
	}

	getData(options?: Partial<FormApplicationOptions>): any {
		return {
			...super.getData(options),
			users: (game as Game).users?.contents,
			characters: (game as Game).actors
		}
	}

	private users: AllUsersResponse | null = null;

	public render(force?: boolean, options?: Application.RenderOptions<FormApplicationOptions>): unknown {
		const res = super.render(force, options);

		WebClient.GetAllUsers()
			.then((res) => {
				this.users = res;

				// Remove any users that have not been setup, for we do not care about them
				$('#ds-member-select-user').children().each(function() {
					// Ignore the first one that is a dummy select option
					if ($(this).prop('disabled'))
						return;

					if (!(res.users.find(x => x.id === $(this).data('ds-id'))))
						$(this).remove();
				});

				$('#ds-form-member-manager').css('display', '');
				$('#ds-loader-member-manager').css('display', 'none');
			})
			.catch(async (err: string) => {
				if (!CheckErrorForValidWorld(err)) {
					ui.notifications?.error('Dice Stats: Unable to get user data. See console for information.');
				}
				await this.close();
			})

		return res;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected _updateObject(event: Event, formData?: Record<string, unknown>): Promise<unknown> {
		return Promise.resolve(undefined);
	}

	activateListeners(html: JQuery): void {
		super.activateListeners(html);

		$('#ds-member-select-user').on('change', (event) => {
			const el = $(event.currentTarget);
			this.OnUserSelect(el.val() as string);
		});
		const inputs = $('input[type=radio][name=ds-characters]');
		inputs.on('change', (event) => this.OnCharacterSelect($(event.currentTarget).data('ds-id')));
		inputs.each(function() {
			$(this).next().on('click', () => {
				$(this).trigger('click');
			});
		});

		$('#ds-member-setup-character').on('click', () => this.OnCharacterSetup());
	}

	OnUserSelect(userId: string): void {
		$('#ds-member-setup-character').prop('disabled', true);
		$('input[type=radio][name=ds-characters]').prop('checked', false);

		const user = (game as Game).users?.contents.find(x => x.id === userId);
		if (!user) {
			ui.notifications?.error('Dice Stats: Unable to resolve user id');
			return;
		}

		const charDivs = $('div[id^="ds-character-"]');
		charDivs.each(function() {
			const id = $(this).data('ds-id');
			const char = (game as Game).actors?.find(x => x.id == id);
			if (!char) {
				Logger.Warn('Selected character id could not be found. - ' + id);
				return;
			}

			if (userId in char.data.permission && char.data.permission[userId] === 3) {
				$(this).css('display', '');
			} else {
				$(this).css('display', 'none');
			}
		});
	}

	OnCharacterSelect(charId: string): void {
		const user = this.users?.users.find(x => x.id === $('#ds-member-select-user').val());
		// If true, they are already assigned to this user
		if (user?.partyMembers.find(x => x.id === charId)) {
			$('#ds-member-setup-character').prop('disabled', true);
		} else {
			$('#ds-member-setup-character').prop('disabled', false);
		}
	}

	OnCharacterSetup(): void {
		$('#ds-member-setup-character').prop('disabled', true);
		const member = $('input[type=radio][name=ds-characters]:checked:first').parent();
		WebClient.CreatePartyMember({
			alive: true,
			name: member.data('ds-name'),
			partyMemberId: member.data('ds-id'),
			userId: $('#ds-member-select-user').val() as string,
		})
		.then((res) => {
			// Remove any matching old characters and place matching one into user array
			this.users!.users = this.users!.users.map((user) => {
				user.partyMembers = user.partyMembers.filter(x => x.id !== res.id);
				return user;
			});
			const user = this.users?.users.find(x => x.id === $('#ds-member-select-user').val() as string);
			user?.partyMembers.push({
				owner: user,
				...res
			});
			ui.notifications?.info(`Dice Stats: PartyMember (${res.name}) created/reassigned.`);
		}).catch((err: AxiosError) => {
			ui.notifications?.error('Dice Stats: Unable to create party member. See Console.');
			console.error(err);
		})
	}

	static get defaultOptions(): FormApplicationOptions {
		const options = super.defaultOptions;
		options.title = 'Manage Party Members';
		options.id = "ds-manage-member-menu";
		options.template = TemplatePath() + 'dice-stats-member-manager.hbs';
		options.closeOnSubmit = false;
		options.popOut = true;
		options.width = 600;
		options.height = 350;
		return options;
	}
}