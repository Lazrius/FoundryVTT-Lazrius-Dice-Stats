export interface HttpResponse {
		message?: string;
	}

export interface SimplePartyMember {
	id: string,
	userId: string,
	name: string,
	created: number,
	alive: boolean,
}

export interface AllPartyMembersResponse extends HttpResponse {
	members: SimplePartyMember[];
}

export interface WorldResponse extends HttpResponse {
	id: string;
	created: number;
	name: string;
	system: string;
}

export interface PartyMemberResponse extends HttpResponse {
	id: string;
	created: number;
	name: string;
	owner: UserResponse;
	alive: boolean;
}

export interface SessionStarted extends HttpResponse {
	id: number;
	started: number;
	finished?: number;
}

export interface UserResponse extends HttpResponse {
	id: string;
	isDm: boolean;
	created: number;
	name: string;
	world: WorldResponse
	partyMembers: PartyMemberResponse[]
}

export interface SessionEnded extends HttpResponse {
	id: number;
	started: number;
	finished?: number;
}
