'use strict';

const nock = require('nock');
const assert = require('assert');
const sinon = require('sinon');
const mockRequire = require('mock-require');
const request = require('request');

const RouterFetcher = require('./../index');
const { RouterFetcherError } = require('./../router-fetcher');

const sandbox = sinon.createSandbox();

describe('RouterFetcher module.', () => {

	const validRouter = {
		endpoint: 'http://valid-router:3014/api/endpoint',
		schema: 'http://valid-router:3014/api/services/{serviceName}/schema'
	};

	const mockPaths = (apiKey, routerConfig) => {
		/* eslint-disable global-require, import/no-dynamic-require */
		mockRequire(RouterFetcher.apiKeyPath, apiKey);
		mockRequire(RouterFetcher.routerConfigPath, routerConfig);
	};

	afterEach(() => {
		sandbox.restore();
		mockRequire.stopAll();
	});

	const routerFetcher = new RouterFetcher();

	describe('getEndpoint', () => {

		it('should return Error with invalid api-key path', async() => {
			await assert.rejects(() => routerFetcher.getEndpoint('any', 'any', 'any'),
				{ name: 'RouterFetcherError', code: RouterFetcherError.codes.INVALID_API_KEY_PATH });
		});

		it('should return Error with invalid router-config path', async() => {

			mockPaths({}, null);

			await assert.rejects(() => routerFetcher.getEndpoint('any', 'any', 'any'),
				{ name: 'RouterFetcherError', code: RouterFetcherError.codes.INVALID_ROUTER_CONFIG_PATH });

		});

		it('should return the endpoint and the httpMethod when the router returns 200', async() => {

			mockPaths({}, validRouter);

			const qs = {
				service: 'true',
				namespace: 'true',
				method: 'true'
			};

			const mockedMicroservice = {
				endpoint: 'http://localhost/foo/bar',
				httpMethod: 'GET'
			};

			nock(validRouter.endpoint)
				.get('')
				.query(qs)
				.reply(200, mockedMicroservice);


			const response = await routerFetcher.getEndpoint('true', 'true', 'true');

			assert.deepStrictEqual(response, mockedMicroservice);
		});

		it('should send httpMethod in the query params to the router if is passed to `getEndpoint` method.', async() => {

			mockPaths({}, validRouter);

			const qs = {
				service: 'true',
				namespace: 'true',
				method: 'true',
				httpMethod: 'method'
			};

			const mockedMicroservice = {
				endpoint: 'http://localhost/foo/bar',
				httpMethod: 'GET'
			};

			nock(validRouter.endpoint)
				.get('')
				.query(qs)
				.reply(200, mockedMicroservice);

			await routerFetcher.getEndpoint('true', 'true', 'true', 'method');
		});

		it('should return an Error when router can not find the endpoints', async() => {

			mockPaths({}, validRouter);

			const qs = {
				service: 'false',
				namespace: 'false',
				method: 'false'
			};

			nock(validRouter.endpoint)
				.get('')
				.query(qs)
				.reply(404, {
					error: 'Could not find endpoints'
				});
			await assert.rejects(() => routerFetcher.getEndpoint('false', 'false', 'false'),
				{ name: 'RouterFetcherError', code: RouterFetcherError.codes.ENDPOINT_NOT_FOUND });
		});

		it('should return a generic error when request library cannot make the call to the ms.', async() => {

			mockPaths({}, validRouter);

			sandbox.stub(request, 'Request').callsFake(({ callback }) => {
				callback(new Error('fatal error'));
			});

			assert.rejects(() => routerFetcher.getEndpoint(), { message: 'fatal error', code: RouterFetcherError.codes.REQUEST_LIB_ERROR });
		});

	});

	describe('getSchema', () => {

		it('should return an RouterFetcherError when the router returns >= 400 status code.', async() => {

			mockPaths({}, validRouter);

			const serviceName = 'false';

			nock(validRouter.schema.replace('{serviceName}', serviceName))
				.get('')
				.reply(404, {
					error: 'Could not find schemas'
				});

			await assert.rejects(() => routerFetcher.getSchema(serviceName),
				{ name: 'RouterFetcherError', code: RouterFetcherError.codes.SCHEMA_NOT_FOUND });
		});

		it('should return the schema when the router returns 200', async() => {

			mockPaths({}, validRouter);

			const mockedResponse = {
				servers: [{}, {}],
				tags: [],
				paths: {}
			};

			const serviceName = 'foo';

			nock(validRouter.schema.replace('{serviceName}', serviceName))
				.get('')
				.reply(200, mockedResponse);

			const response = await routerFetcher.getSchema(serviceName);

			assert.deepStrictEqual(response, mockedResponse);
		});

		it('should return a generic error when request library cannot make the call to the ms.', async() => {

			mockPaths({}, validRouter);

			sandbox.stub(request, 'Request').callsFake(({ callback }) => {
				callback(new Error('fatal error'));
			});

			assert.rejects(() => routerFetcher.getSchema(), { message: 'fatal error', code: RouterFetcherError.codes.REQUEST_LIB_ERROR });
		});
	});

});
