import Globals from "./Globals";

export const TemplatePath = (): string => `${Globals.IsModule ? "modules" : "systems"}/${Globals.ModuleName}/templates/`;

const PreloadTemplates = async (): Promise<Handlebars.TemplateDelegate[]> => {
	const templates: Array<string> = [
		"dice-stats-config.hbs",
		"dice-stats-member-manager.hbs",
		"dice-stats-user-manager.hbs",
	];
	return loadTemplates(templates.map(x => TemplatePath() + x));
}

export default PreloadTemplates;