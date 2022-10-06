import { HttpBody } from "@deepkit/http";
import {
    InteractionResponseType,
} from 'discord-interactions';
import type { DiscordIntegrationGeneral } from '../controllers/Garry.controller';

enum CommandsBaseEnum {
    ping = "ping",
    server = "server",
	user = "user",
	commands = "commands"
}
/**
 * Extendable base class for user commands
 */
class CommandsBaseImpl {
	data: HttpBody<DiscordIntegrationGeneral>;

	constructor(data: HttpBody<DiscordIntegrationGeneral>) {
		this.data = data;
	}

	protected _userDesc = () => ({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `I am studiying you all to give the best answer later on.`
		}
	});

	protected _serverDesc = () => ({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `Honestly, I have no idea what this server is all about...`
		}
	});

	protected readonly _pong = () => ({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `Pong: ${this._getRandomEmoji()}`
		}
	});

	protected readonly _getRandomEmoji = () => {
		const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
		return emojiList[Math.floor(Math.random() * emojiList.length)];
	}

	protected readonly _getCommandList = () => ({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: Object.keys(CommandsBaseEnum).map(k => `/${k}\n`).join('')
		}
	})

	protected readonly _unknown = () => ({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `And what am I supposed to do with this?`
		}
	});

	public getCommand() {
		const command: CommandsBaseEnum = this.data?.name;
		const commandList = {
			[CommandsBaseEnum.ping]: this._pong,
			[CommandsBaseEnum.server]: this._serverDesc,
			[CommandsBaseEnum.user]: this._userDesc,
			[CommandsBaseEnum.commands]: this._getCommandList
		};

		return commandList[command]?.() ?? this._unknown();
	}
}

export { CommandsBaseEnum, CommandsBaseImpl };