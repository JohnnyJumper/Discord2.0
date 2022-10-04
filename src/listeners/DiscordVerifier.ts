import { eventDispatcher } from "@deepkit/event";
import { HtmlResponse, httpWorkflow } from "@deepkit/http";
import { Logger } from "@deepkit/logger";
import { cast } from "@deepkit/type";
import { verifyKey } from "discord-interactions";
import { Config } from "../config";
import { DiscordGroup } from "../types";

export class DiscordVerifier {
	
	constructor(
		private logger: Logger,
		private readonly clientSecret: Config['clientSecret']
	) {}

	@eventDispatcher.listen(httpWorkflow.onController)
	onController(event: typeof httpWorkflow.onController.event) {
		if (event.route.groups.includes(DiscordGroup)) {
			this.logger.info(`Verifiying user's access level.`);
			const headers = event.request.headers;

			const signature = cast<string>(headers['x-signature-ed25519']); // Discord sends this header lowercased.
			const timestamp = cast<string>(headers['x-signature-timestamp']); // Discord sends this header lowercased.

			const rawBody = JSON.stringify(event.request.body);
			const isValidRequest = verifyKey(rawBody, signature, timestamp, this.clientSecret);
			if (!isValidRequest) {
				event.request.store = {
					reason: 'Bad request signature'
				}
				event.accessDenied();
			}
		}
	}

	@eventDispatcher.listen(httpWorkflow.onAccessDenied)
	onControllerError(event: typeof httpWorkflow.onAccessDenied.event) {
		if (event.request.store.reason === 'Bad request signature') {
			event.clearNext();
			return event.send(new HtmlResponse('Bad request signature',  401));
		}
		return event.send(new HtmlResponse('Access Denied', 403));
	}
}