'use strict';

const assert = require('assert');

const RouterFetcherError = require('../lib/router-fetcher-error');

describe('Router Fetcher Error', () => {

	it('Should accept a message error and a code', () => {
		const error = new RouterFetcherError('Some error', RouterFetcherError.codes.SCHEMA_NOT_FOUND);

		assert.strictEqual(error.message, 'Some error');
		assert.strictEqual(error.code, RouterFetcherError.codes.SCHEMA_NOT_FOUND);
		assert.strictEqual(error.name, 'RouterFetcherError');
	});

	it('Should accept an error instance and a code', () => {

		const previousError = new Error('Some error');

		const error = new RouterFetcherError(previousError, RouterFetcherError.codes.SCHEMA_NOT_FOUND);

		assert.strictEqual(error.message, 'Some error');
		assert.strictEqual(error.code, RouterFetcherError.codes.SCHEMA_NOT_FOUND);
		assert.strictEqual(error.name, 'RouterFetcherError');
		assert.strictEqual(error.previousError, previousError);
	});
});
