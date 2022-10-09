import { InteractionResponseType, InteractionType } from "discord-interactions";

export const DiscordGroup = 'DiscordGroup';

export enum CommandName {
  ping = "ping",
  server = "server",
	user = "user",
	commands = "commands",
	gif = "gif",
	unknown = "unknown"
}

export type CommandOutput = {
	type: InteractionResponseType;
	data: {
			content: string;
	};
}

export type CommandList = { 
	[key in CommandName]: (args?: DiscordCommandOption[]) => CommandOutput | Promise<CommandOutput>
};

export type DiscordCommandOption = {
	type: number,
	name: string,
	value: string
}

export type DiscordCommandData = {
	guild_id: string,
	id: string,
	name: string,
	type: number,
	options?: DiscordCommandOption[]
}

export type DiscordIntegrationGeneral = {
	type: InteractionType,
	id: string,
	data: DiscordCommandData
};


export type DiscordIntegrationConnect = {
	id: string,
	token: string,
	type: InteractionType.PING,
}

export const isDiscordIntegrationConnect = (obj: any): obj is DiscordIntegrationConnect => {
	return (!!obj && "type" in obj && obj.type === InteractionType.PING);
}

export const isCommandName = (obj: string): obj is CommandName => {
	return !!obj && Object.values(CommandName).some(v => v === obj);
}
