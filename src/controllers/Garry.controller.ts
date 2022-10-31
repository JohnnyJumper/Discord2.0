import { http, HttpBody } from "@deepkit/http";
import { Logger } from "@deepkit/logger";
import { cast } from "@deepkit/type";
import {
  InteractionType,
  InteractionResponseType,
} from 'discord-interactions';
import { CommandsProvider } from "../providers/CommandsProvider";
import { 
	CommandName, 
	DiscordGroup, 
	DiscordIntegrationConnect, 
	DiscordIntegrationGeneral, 
	isCommandName, 
	isDiscordIntegrationConnect 
} from "../types";
import util from 'util';
import fetch from 'node-fetch';
import { Config } from "../config";

@http.controller('/garry').group(DiscordGroup)
export class GarryController {

	constructor(
		private logger: Logger,
		private commandsProvider: CommandsProvider,
		private config: Config
		) {}

	@http.POST('/integrations')
	async integrations(body: HttpBody<DiscordIntegrationGeneral | DiscordIntegrationConnect | any>) {
		this.logger.info(body);
		const { type } = body;
		
		if (isDiscordIntegrationConnect(body)) {
			this.logger.info('Received Ping, sending Pong');			
			return { type: InteractionResponseType.PONG };
		}

		if (type === InteractionType.APPLICATION_COMMAND) {
			const { name } = body.data;
			this.logger.info(`Received following command: ${name}, looking it up`);

			if (!isCommandName(name)) {
				return this.commandsProvider.getUnknownResponse();
			}
			
			if (name === CommandName.gif) {
				const commandOption = body.data.options?.[0];
				if (!commandOption) {
					return this.commandsProvider.getUnknownResponse();
				}
				return this.commandsProvider.getCommand(name, [commandOption])
			}
			
			return this.commandsProvider.getCommand(name);
		}

		if (type === InteractionType.MESSAGE_COMPONENT) {
			this.logger.info('got interaction event', util.inspect(body, false, null));

			const custom_id = cast<string>(body.data.custom_id);
			const interactionId = cast<string>(body.id);
			const token = cast<string>(body.token);
			const messageContent = cast<string>(body.message.content);
			const channelId = cast<string>(body.channel_id);

			const [_, term, offsetStr] = custom_id.split(':');
			const offset = cast<number>(offsetStr);
			if (custom_id.startsWith('shuffle')) {
				const commands = [
					{name: 'term', value: term, type: -1},
					{name: 'offset', value: (Number(offset) + 1).toString(), type: -1}
				]
				const giphyResponse = await this.commandsProvider.getCommand('gif', commands);
				await this.updateMessage(term, giphyResponse.data.content, interactionId, token, false, offset);
			} else {
				await this.sendChoosenImage(messageContent, channelId, term);
				await this.updateMessage("", '.', interactionId, token, true, offset);
			}
		}
	}

	private async sendChoosenImage(gifUrl: string, channelId: string, term: string) {
		const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
		this.logger.info(`calling for sending image: ${url}`);
		return fetch(url, {
			headers: {
				"Authorization":`Bot ${this.config.discordToken}`,
				"Content-Type": "application/json"
			},
			method: "POST",
			body: JSON.stringify({
				embeds: [{
					title: `Prompt: ${term}`,
					image: {
						url: gifUrl
					}
				}]
			})
		});
	}


	private async updateMessage(term: string, newGif: string, interactionId: string, interactionToken: string, removeButtons: boolean = false, offset: number = 0) {
		const url = `https://discord.com/api/v10/interactions/${interactionId}/${interactionToken}/callback`;
		const offsetStr = (offset + 1).toString();
		const components = [{
			type: 1,
			components: [
				{
					style: 2,
					label: `Shuffle`,
					custom_id: `shuffle:${term}:${offsetStr}`,
					disabled: false,
					type: 2
				},
				{
					style: 1,
					label: `Send`,
					custom_id: `send:${term}:${offsetStr}`,
					disabled: false,
					type: 2
				}
			]
		}];
		const body = {
			type: InteractionResponseType.UPDATE_MESSAGE,
			data: {
				content: newGif,
				flags: 1 << 6,
				components: []
			}
		};

		const response = await fetch(url, {
			headers: {
				"Authorization":`Bot ${this.config.discordToken}`,
				"Content-Type": "application/json"
			},
			method: "POST",
			body: removeButtons ? JSON.stringify(body) : JSON.stringify({...body, data: {...body.data, components}})
		});
		this.logger.info(response);
		if (response.status !== 204 ) {
			this.logger.error(await response.json());
			this.logger.error('Panic');
		}
	}
}