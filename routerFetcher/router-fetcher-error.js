'use strict';

class RouterFetcherError extends Error {
	constructor(statusCode, statusMessage, headers, body) {
		super();
		this.name = 'RouterFetcherError';
		this.statusCode = statusCode;
		this.statusMessage = statusMessage;
		this.headers = headers;
		this.body = body;
	}
}

module.exports = RouterFetcherError;
