import { createModule } from "@deepkit/app";
import { Config } from "../config";
import { GarryController } from "../controllers/Garry.controller";
import { DiscordVerifier } from "../listeners/DiscordVerifier";
import { GyphyProvider } from "../providers/Gyphy";

export class RootModule extends createModule({
	config: Config,
	controllers: [GarryController],
	listeners: [DiscordVerifier],
	providers: [GyphyProvider]
}) { }
