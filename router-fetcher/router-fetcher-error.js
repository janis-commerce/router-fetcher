'use strict';

class RouterFetcherError extends Error {

	static get codes() {

		return {
			INVALID_API_KEY_PATH: 1,
			SCHEMA_NOT_FOUND: 2,
			INVALID_ROUTER_CONFIG_PATH: 3,
			ENDPOINT_NOT_FOUND: 4,
			REQUEST_LIB_ERROR: 5
		};
	}

	constructor(err, code) {
		super(err);
		this.name = 'RouterFetcherError';
		this.message = err.message || err;
		this.code = code;
	}
}

module.exports = RouterFetcherError;
