import factory, {Axios, AxiosResponse} from "axios";
import {HttpResponse} from "./Models/Responses";
import HttpStatusCode from "./Models/HttpStatusCode";
import Logger from "./Utils/Logger";

export interface WebClientSettings {
	apiUrl: URL;
	secretKey: string;
}

const ReplaceWorldId = (str: string, id: number) => str.replace('%worldId%', id.toString());
const ReplaceUserId = (str: string, id: number) => str.replace('%userId%', id.toString());
const ReplacePartyMemberId = (str: string, id: number) => str.replace('%partyMemberId%', id.toString());

enum Requests {
	SessionBegin = "/session/begin",
	SessionEnd = "/session/end",
	CreateUser = "/user/create?worldId=%worldId%",
	GetUserByWorldAndName = "/user?world=%worldId%&name=",
	GetUserByWorldAndId = "/user?world=%worldId%&id=%userId%",
	CreateWorld = "/world/create",
	RenameWorld = "/world/rename",
	GetPartyMemberById = "/member?worldId=%worldId%&id=%partyMemberId%",
	GetAllPartyMembers = "/member/all",
	CreatePartyMember = "/member/create",
	AddNewRoll = "/roll/add"
}

export class WebClient {
	private constructor() {
		WebClient.client = this;
	}

	private static client: WebClient | null = null;
	private settings: WebClientSettings = {
		apiUrl: new URL('localhost:3000'),
		secretKey: ''
	};

	private axios: Axios = factory.create({
		baseURL: this.settings.apiUrl.toString(),
		timeout: 5000,
		headers: { 'x-api-key': this.settings.secretKey }
	});

	private static PreflightChecks(): WebClient {
		if (WebClient.client === null)
			new WebClient();

		return WebClient.client as WebClient;
	}

	private async Post<Request, Response extends HttpResponse>(url: string, body: Request | undefined = undefined,
          expectedCode = 200): Promise<Response> {
		const response = await this.axios.post(url, body);
		return WebClient.HandleResponse(response, expectedCode);
	}

	private async Get<Response extends HttpResponse>(url: string, expectedCode = 200): Promise<Response> {
		const response = await this.axios.get(url);
		return WebClient.HandleResponse(response, expectedCode);
	}

	private static async HandleResponse<Response extends HttpResponse>(response: AxiosResponse, expectedCode: number): Promise<Response> {
		if (response.status === HttpStatusCode.INTERNAL_SERVER_ERROR) {
			return Promise.reject(response.data);
		}

		const data = response.data as Response;
		if (response.status !== expectedCode) {
			return Promise.reject('Response was not expected code.\nMessage: ' + data.message);
		}

		return Promise.resolve(data);
	}

	public static GetCurrentSettings(): WebClientSettings {
		const client = this.PreflightChecks();
		return client.settings;
	}

	public static Reinitialise(settings: WebClientSettings): void {
		const client = this.PreflightChecks();
		client.settings = settings;
		client.axios = factory.create({
			baseURL: client.settings.apiUrl.toString(),
			headers: { 'x-api-key': client.settings.secretKey }
		});

		// Test connection
		factory.get(settings.apiUrl.toString(), { headers: { 'x-api-key': client.settings.secretKey } })
		.then(() => {
			ui.notifications?.info('Dice Stats: Connection test successful');
		})
		.catch((err: Error) => {
			ui.notifications?.error('Dice Stats: Connection Test Failed. See console (F12) for more information');
			Logger.Err('Err while testing connection.');
			console.error(err);
		});
	}

	public static async BeginSession(): Promise<HttpResponse> {
		const client = this.PreflightChecks();
		return await client.Post(Requests.SessionBegin);
	}
}