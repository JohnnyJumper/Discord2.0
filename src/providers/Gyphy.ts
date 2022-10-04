import { Logger } from "@deepkit/logger";
import { deserialize } from "@deepkit/type";
import fetch from "node-fetch";
import { Config } from "../config";

type GyphyData = {
	type: string,
	id: string,
	slug: string,
	url: string,
	bitly_url: string,
	embed_url: string,
	username: string,
	source: string,
	rating: string,
	content_url: string,
	user?: any,
	source_tld: string,
	source_post_url: string,
	update_datetime: Date,
	create_datetime: Date,
	import_datetime: Date,
	trending_datetime: Date,
	images: any,
	title: string,
}

type GyphyMeta = {
	msg: string,
	status: number,
	response_id: string
}

type GyphyPagination = {
	offset: number,
	total_count: number,
	count: number
}

type GyphyResponse = {
	data: GyphyData[],
	meta: GyphyMeta,
	pagination: GyphyPagination
}

export class GyphyProvider { 

	private readonly searchEndpoint;

	constructor(
		private logger: Logger, 
		private gyphyKey: Config["gyphyKey"]
	) {
		this.searchEndpoint = "https://api.giphy.com/v1/gifs/search";
	}

	async search(term: string): Promise<GyphyResponse> {
		const url = this._buildSearchUrl(term);
		this.logger.info(`Fetching from: ${url}`);
		const response = await fetch(url, { method: "GET" } );
		const rawJson = await response.json();
		this.logger.info(rawJson);
		return deserialize<GyphyResponse>(rawJson);
	}

	private _buildSearchUrl(term: string) {
		return `${this.searchEndpoint}?api_key=${this.gyphyKey}&limit=1&lang=en&q=${term}`;
	}
}