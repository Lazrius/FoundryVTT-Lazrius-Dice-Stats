import NewDiceRequest from "./NewDiceRequest";
export default interface NewRollRequest {
	formula: string;
	total: number;
	partyMember: string;
	user: string;
	dice: NewDiceRequest[];
	flavour: string | undefined;
	chatMessageId: string;
}
