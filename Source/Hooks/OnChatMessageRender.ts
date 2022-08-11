import {WebClient} from "../WebClient";
import {AlertOnFailure, DebugMode, RequireFlavourText} from "../Menus/SettingsMenu";
import Logger from "../Utils/Logger";
import {AxiosError} from "axios";
import HttpStatusCode from "../Models/HttpStatusCode";
import {HttpResponse} from "../Models/Responses";

export const OnChatMessageRender = (msg: ChatMessage, html: JQuery<HTMLElement>) => {
	if (!msg.isRoll || !msg.roll)
		return;

	if (RequireFlavourText() && !msg.data.flavor) {
		if (DebugMode()) {
			ui.notifications?.warn('Dice Stats: Roll without flavour text is ignored.');
			Logger.Warn('Roll without flavour text is ignored.');
		}
		return;
	}

	if (!WebClient.GetCurrentSettings().sessionActive) {
		if (DebugMode()) {
			ui.notifications?.warn('Dice Stats: Roll ignored due to inactive session.');
			Logger.Warn('Roll ignored due to inactive session.');
		}
		return;
	}

	if (!msg.data.speaker.actor || !msg.data.user || !msg.roll.total) {
		if (DebugMode()) {
			ui.notifications?.warn('Dice Stats: Dice was missing speaker or roll data.');
		}
		return;
	}

	WebClient.CreateRoll({
		dice: msg.roll.dice.map((d) => {
			return {
				diceNumber: d.faces,
				diceOutcome: d.total as number,
			}
		}),
		flavour: msg.data.flavor,
		formula: msg.roll.formula,
		partyMember: msg.data.speaker.actor,
		total: msg.roll.total,
		user: msg.data.user,
		chatMessageId: msg.id!,
	}).then((res) => {
		if (DebugMode()) {
			ui.notifications?.info('Dice Stats: ' + res.message);
		}
		Logger.Ok('Successfully added new dice to db.');
	}).catch((err: AxiosError) => {
		console.error(err);

		if (err.response?.status === HttpStatusCode.BAD_REQUEST) {
			if (AlertOnFailure() || DebugMode()) {
				ui.notifications?.warn('Dice Stats: ' + (err.response.data as HttpResponse).message);
			}
			Logger.Err('Unable to save')
			return;
		}

		if (AlertOnFailure() || DebugMode()) {
			ui.notifications?.warn('Dice Stats: Unable to save roll to database. Data is lost.');
		}
	})
}