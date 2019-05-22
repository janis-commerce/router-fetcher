'use strict';

const RouterFetcherError = require('./router-fetcher-error');

class RouterFetcherInvalidService extends RouterFetcherError {
	constructor(statusCode, statusMessage, headers, body) {
		super(statusCode, statusMessage, headers, body);
		this.name = 'RouterFetcherInvalidService';
	}
}

module.exports = RouterFetcherInvalidService;
