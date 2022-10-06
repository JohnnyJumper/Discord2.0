import { http, HttpBody } from "@deepkit/http";
import { Logger } from "@deepkit/logger";

import {
  InteractionType,
  InteractionResponseType,
} from 'discord-interactions';
import { CommandsBaseImpl } from "../commands/CommandsBase";
import { GyphyProvider } from "../providers/Gyphy";
import { DiscordGroup } from "../types";

type DiscordCommandOption = {
	type: number,
	name: string,
	value: string
}

type DiscordCommandData = {
	guild_id: string,
	id: string,
	name: string,
	type: number,
	options?: DiscordCommandOption[]
}

type DiscordIntegrationGeneral = {
	type: InteractionType,
	id: string,
	data: DiscordCommandData
};

@http.controller('/garry').group(DiscordGroup)
export class GarryController {

	constructor(
		private logger: Logger,
		private gyphy: GyphyProvider
		) {}

	@http.POST('/integrations')
	async integrations(body: HttpBody<DiscordIntegrationGeneral>) {
		const { type, id, data } = body;
	
		if (type === InteractionType.PING) {
			this.logger.info('Received Ping, sending Pong');			
			return { type: InteractionResponseType.PONG };
		}

		this.logger.info('body ', body);
		if (type === InteractionType.APPLICATION_COMMAND) {
			this.logger.info(body);
			/** TODO: move gif commands into commands */
			if (data.name === "gif") {
				const commandOption = data.options?.[0];
					if (!commandOption) {
						return this._superWrongError();
					}
				return this._getGif(commandOption);
			}
			/** Mb convert  CommandsBase into singelton, to reuse data across all inherentes */
			return new CommandsBaseImpl(data).getCommand();
		}
	}

	private async _getGif(arg: DiscordCommandOption) {
		if (arg.name !== 'term') {
			return this._superWrongError();
		}
		const term = arg.value;
		const gyphyReponse =  await this.gyphy.search(term);
		return {
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: gyphyReponse.data[0]?.embed_url ?? `Nothing epic found for term ${term}` 
			}
		}
	}

	private _superWrongError() {
		return {
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: `Something went super duper uper wrong`
			}
		}
	}
}