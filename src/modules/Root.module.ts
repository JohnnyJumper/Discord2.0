import { createModule } from "@deepkit/app";
import { Config } from "../config";
import { GarryController } from "../controllers/Garry.controller";
import { DiscordVerifier } from "../listeners/DiscordVerifier";
import { GyphyProvider } from "../providers/Gyphy";
import { CommandsProvider } from "../providers/CommandsProvider";
import { DiscordClient } from "../providers/DiscordClient";
import { GatewayIntentBits } from "discord.js";

export class RootModule extends createModule({
	config: Config,
	controllers: [GarryController],
	listeners: [DiscordVerifier],
	providers: [
		GyphyProvider,
		CommandsProvider,
		{
			provide: DiscordClient,
			useFactory: () => {
				return new DiscordClient({
					intents: [GatewayIntentBits.Guilds],
					rest: { }

				});
			}
		}
	]
}) { }
