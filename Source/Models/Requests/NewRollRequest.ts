import NewDiceRequest from "./NewDiceRequest";
export default interface NewRollRequest {
	id: string;
	formula: string;
	total: number;
	partyMember: string;
	user: string;
	dice: NewDiceRequest[];
	flavour: string | undefined;
}
