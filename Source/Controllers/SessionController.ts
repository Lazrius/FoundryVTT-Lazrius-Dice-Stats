import {WebClient} from "../WebClient";
import Logger from "../Utils/Logger";
import {AlertOnFailure, DebugMode} from "../Menus/SettingsMenu";

let dialog: Dialog;

export const SessionDialog = (): void => {
	const html = `
<div class='ds-loader'>
	<img src="icons/svg/clockwork.svg" alt='loading animation'>
	<h3>Loading Session Data</h3>
</div>
	`;
	dialog = new Dialog({
		title: 'Session Manager',
		content: html,
		buttons: {
			start: {
				icon: "<i class='fas fa-play'></i>",
				label: 'Start Session',
				callback: StartSession,
			},
			stop: {
				icon: "<i class='fas fa-pause'></i>",
				label: 'Conclude Session',
				callback: StopSession,
			}
		},
		render: OnRender
	}, {
		height: 300,
		width: 600,
		title: 'Session Manager',
	});
	dialog.render(true);
}

const GetDuration = (started: number): [number, number] => {
	const then = new Date(started);
	const now = new Date(Date.now());
	const diff = Math.abs(now.getTime() - then.getTime());
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.round(diff / (1000 * 60)) - hours * 60;
	return [hours, minutes];
}

const OnRender = (html: JQuery | HTMLElement) => {
	const $$ = html as JQuery;
	const buttons = $$.last().children();
	buttons.each(function () {
		const el = $(this);
		el.css('max-height', '50px');
		el.css('align-self', 'flex-end');
		el.prop('disabled', true);
	});

	console.log(buttons);

	WebClient.GetCurrentSession()
		.then((res) => {
			const content = $$.first();
			if (!content)
				return;

			if (res.activeSession) {
				const duration = GetDuration(res.started * 1000);
				content.html(`
					<i class='fas fa-dice-d20 ds-centre-underline'></i>
					<p class='ds-subtitle'>Started: ${new Date(res.started * 1000).toTimeString()}</p>
					<p class='ds-subtitle'>Running for: ${duration[0]} hours and ${duration[1]} minutes.</p>
				`)
				buttons.last().prop('disabled', false);
			} else {
				content.html(`
					<h1 class='ds-centre-underline'>There is currently no session active.</h1>
				`);
				buttons.first().prop('disabled', false);
			}
		})
		.catch(async (err: Error) => {
			await dialog.close();
			Logger.Err('Error getting current session information.');
			console.error(err);
		})
}

const StartSession = () => {
	WebClient.BeginSession()
		.then((res) => {
			ui.notifications?.info('Dice Stats: ' + res.message);
			WebClient.SetSessionState(true);
		})
		.catch((err) => {
			if (AlertOnFailure()) {
				ui.notifications?.error('Dice Stats: Unable to start session. See console for errors.');
			}

			Logger.Err('Unable to start session.');
			console.error(err);
			WebClient.SetSessionState(false);
		});
}

const StopSession = () => {
	WebClient.EndSession()
		.then((res) => {
			ui.notifications?.info('Dice Stats: ' + res.message);
			WebClient.SetSessionState(false);
		})
		.catch((err) => {
			if (AlertOnFailure()) {
				ui.notifications?.error('Dice Stats: Unable to end session. See console for errors.');
			}

			WebClient.SetSessionState(true);
			Logger.Err('Unable to end session.');
			console.error(err);
		});
}