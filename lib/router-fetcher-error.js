'use strict';

class RouterFetcherError extends Error {

	static get codes() {

		return {
			SCHEMA_NOT_FOUND: 2,
			INVALID_ROUTER_CONFIG_SETTING: 3,
			ENDPOINT_NOT_FOUND: 4,
			AXIOS_LIB_ERROR: 5
		};
	}

	constructor(err, code) {

		const message = err.message || err;

		super(message);
		this.message = message;
		this.code = code;
		this.name = 'RouterFetcherError';

		if(err instanceof Error)
			this.previousError = err;
	}
}

module.exports = RouterFetcherError;
