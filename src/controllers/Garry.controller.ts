import { http, HttpBody } from "@deepkit/http";
import { Logger } from "@deepkit/logger";
import { cast } from "@deepkit/type";
import {
  InteractionType,
  InteractionResponseType,
} from 'discord-interactions';
import { CommandsProvider } from "../providers/CommandsProvider";
import { CommandName, DiscordGroup, DiscordIntegrationConnect, DiscordIntegrationGeneral, isCommandName, isDiscordIntegrationConnect } from "../types";

@http.controller('/garry').group(DiscordGroup)
export class GarryController {

	constructor(
		private logger: Logger,
		private commandsProvider: CommandsProvider
		) {}

	@http.POST('/integrations')
	async integrations(body: HttpBody<DiscordIntegrationGeneral | DiscordIntegrationConnect>) {
		this.logger.info(body);
		const { type } = body;
		
		if (isDiscordIntegrationConnect(body)) {
			this.logger.info('Received Ping, sending Pong');			
			return { type: InteractionResponseType.PONG };
		}

		this.logger.info('body ', body);
		if (type === InteractionType.APPLICATION_COMMAND) {
			this.logger.info(body);
			const { name } = body.data;
			let command: (arg?: any) => any;
			
			if (isCommandName(name)) {
				if (name === CommandName.gif) {
					const commandOption = body.data.options?.[0];
					if (!commandOption) {
						return this.commandsProvider.getUnknownResponse();
					}
					return this.commandsProvider.getCommand(name, [commandOption])
				}
				return this.commandsProvider.getCommand(name);
			}
			return this.commandsProvider.getUnknownResponse();
		}
	}
}