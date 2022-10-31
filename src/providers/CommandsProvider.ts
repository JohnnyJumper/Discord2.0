import { Logger } from "@deepkit/logger";
import {
    InteractionResponseType,
} from 'discord-interactions';
import { CommandList, CommandName, DiscordCommandOption } from "../types";
import { GyphyProvider } from "./Gyphy";

export class CommandsProvider {

	private commandList: CommandList;

	constructor(
		private logger: Logger,
		private gyphy: GyphyProvider, 
	) {
		this.commandList = {
			[CommandName.ping]: this._pong.bind(this),
			[CommandName.server]: this._serverDesc.bind(this),
			[CommandName.user]: this._userDesc.bind(this),
			[CommandName.commands]: this._getCommandList.bind(this),
			[CommandName.gif]: this._getGif.bind(this),
			[CommandName.unknown]: this._unknown.bind(this)
		};
	}

	public async getCommand(command: keyof typeof CommandName, args?: DiscordCommandOption[]) {
		this.logger.info(`Looking for a command ${command}`);
		const func = this.commandList[command];
		if (!!func) {
			this.logger.info(`Executing the function and returning the result`);
			return func(args);
		}
		this.logger.warning(`Function ${command} was not found, gracefully letting the user know`);
		return this._unknown();
	}

	public getUnknownResponse() {
		return this._unknown();
	}

	/* Commands Implementations */
	private _userDesc = () => ({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `I am studiying you all to give the best answer later on.`
		}
	});

	private _serverDesc = () => ({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `Honestly, I have no idea what this server is all about...`
		}
	});

	private async _getGif(args?: DiscordCommandOption[]) {
		this.logger.error(args);
		if (!args) {
			return  this._unknown();
		}
		const arg = args[0];
		if (arg.name !== 'term') {
			return this._unknown();
		}
		const term = arg.value;
		const offset = args[1]?.value ?? "0";
		const gyphyReponse =  await this.gyphy.search(term, offset);
		this.logger.info({
			arg0: args[0],
			arg1: args[1],
			value1: args[1]?.value
		})
		return {
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				flags: 1 << 6, // make it ephemernal
				content: gyphyReponse.data[0]?.images?.original?.url ?? `Nothing epic found for term ${term}`,
				components: [{
					type: 1,
					components: [
						{
							style: 2,
							label: `Shuffle`,
							custom_id: `shuffle:${term}:${offset}`,
							disabled: false,
							type: 2
						},
						{
							style: 1,
							label: `Send`,
							custom_id: `send:${term}:${offset}`,
							disabled: false,
							type: 2
						}
					]
				}]
			}
		}
	}

	private readonly _pong = () => ({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `Pong: ${this._getRandomEmoji()}`
		}
	});

	private readonly _getRandomEmoji = () => {
		const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
		return emojiList[Math.floor(Math.random() * emojiList.length)];
	}

	private readonly _getCommandList = () => ({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: Object.keys(CommandName).map(k => `/${k}\n`).join('')
		}
	})

	private readonly _unknown = () => ({
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `And what am I supposed to do with this?`
		}
	});
}