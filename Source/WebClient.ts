import factory, {Axios, AxiosResponse} from "axios";
import {
	AllUsersResponse,
	HttpResponse, PartyMemberResponse,
	SessionEnded,
	SessionStarted, SimplePartyMember,
	UserResponse,
	WorldResponse
} from "./Models/Responses";
import HttpStatusCode from "./Models/HttpStatusCode";
import Logger from "./Utils/Logger";
import NewWorldRequest from "./Models/Requests/NewWorldRequest";
import NewUserRequest from "./Models/Requests/NewUserRequest";
import {GetWorldId} from "./Utils";
import {NewPartyMemberRequest} from "./Models/Requests/NewPartyMemberRequest";

export interface WebClientSettings {
	apiUrl: URL;
	secretKey: string;
}

const ReplaceWorldId = (str: string, id: string) => str.replace('%worldId%', id.toString());
const ReplaceUserId = (str: string, id: string) => str.replace('%userId%', id.toString());
const ReplacePartyMemberId = (str: string, id: string) => str.replace('%partyMemberId%', id.toString());

enum Requests {
	GetCurrentSession = "/session",
	SessionBegin = "/session/begin",
	SessionEnd = "/session/end",
	CreateUser = "/user/create?world=%worldId%",
	GetUserByWorldAndName = "/user?world=%worldId%&name=",
	GetUserByWorldAndId = "/user?world=%worldId%&id=%userId%",
	GetAllUsersInWorld = "/user/all?world=%worldId%",
	CreateWorld = "/world/create",
	UpdateWorld = "/world/update",
	GetWorld = "/world?world=%worldId%",
	GetPartyMemberById = "/member?world=%worldId%&id=%partyMemberId%",
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

	private SetSettings(settings: WebClientSettings) {
		this.settings = settings;
	}

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
			Logger.Err('Dice-Stats API Internal Server Error');
			console.error(response);
			return Promise.reject(response.data);
		}

		const data = response.data as Response;
		if (response.status !== expectedCode) {
			Logger.Err('Response code was not expected. Was ' + response.status + ', Expected ' + expectedCode);
			console.error(response);
			return Promise.reject(data.message);
		}

		return Promise.resolve(data);
	}

	public static GetCurrentSettings(): WebClientSettings {
		const client = this.PreflightChecks();
		return client.settings;
	}

	public static Reinitialise(settings: WebClientSettings): void {
		const client = this.PreflightChecks();
		client.SetSettings(settings);
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

	public static GetCurrentSession(): Promise<{ activeSession: boolean, id: number, started: number }> {
		const client = this.PreflightChecks();
		return client.Get(Requests.GetCurrentSession, HttpStatusCode.OK)
		.then((res) => {
			if ('started' in res) {
				const session = res as SessionEnded;
				return Promise.resolve({
					activeSession: true,
					id: session.id,
					started: session.started
				});
			} else {
				return Promise.resolve({
					activeSession: false,
					id: 0,
					started: 0
				});
			}
		})
		.catch((err) => {
			return Promise.reject(err);
		});
	}

	public static async BeginSession(): Promise<SessionStarted> {
		const client = this.PreflightChecks();
		return client.Post(Requests.SessionBegin, HttpStatusCode.CREATED);
	}

	public static async EndSession(): Promise<SessionEnded> {
		const client = this.PreflightChecks();
		return client.Post(Requests.SessionEnd);
	}

	public static async GetAllUsers(): Promise<AllUsersResponse> {
		const client = this.PreflightChecks();
		const url = ReplaceWorldId(Requests.GetAllUsersInWorld, GetWorldId());
		return client.Get(url);
	}

	public static async CreateUser(req: NewUserRequest): Promise<UserResponse> {
		const client = this.PreflightChecks();
		const url = ReplaceWorldId(Requests.CreateUser, GetWorldId());
		return client.Post(url, req, HttpStatusCode.CREATED);
	}

	public static async GetWorldInformation(): Promise<WorldResponse> {
		const client = this.PreflightChecks();
		const url = ReplaceWorldId(Requests.GetWorld, GetWorldId());
		return client.Get(url)
	}

	private static async CreateOrUpdateWorld(req: NewWorldRequest, code: number, setup: boolean): Promise<WorldResponse> {
		const client = this.PreflightChecks();
		const url = setup ? Requests.CreateWorld : Requests.UpdateWorld;
		return client.Post(url, req, code);
	}

	public static CreateWorld = async (req: NewWorldRequest): Promise<WorldResponse> =>
		WebClient.CreateOrUpdateWorld(req, HttpStatusCode.CREATED, true);
	public static UpdateWorld = async (req: NewWorldRequest): Promise<WorldResponse> =>
		WebClient.CreateOrUpdateWorld(req, HttpStatusCode.OK,false);

	public static CreatePartyMember = async (req: NewPartyMemberRequest): Promise<SimplePartyMember> => {
		const client = this.PreflightChecks();
		const url = Requests.CreatePartyMember;
		return client.Post(url, req, HttpStatusCode.CREATED);
	}
}