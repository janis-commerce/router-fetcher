'use strict';

const nock = require('nock');
const assert = require('assert');
const sinon = require('sinon');
const request = require('request');

const RouterFetcher = require('./../index');
const { endpoint, schema } = require('./../config/router');

const sandbox = sinon.createSandbox();

describe('RouterFetcher module.', () => {

	afterEach(() => {
		sandbox.restore();
	});

	const routerFetcher = new RouterFetcher('fizzmoadrg');

	describe('getEndpoint', () => {

		it('should return an MicroServiceCallInvalidService error when the router returns >= 400 status code.', async() => {

			const qs = {
				service: 'false',
				namespace: 'false',
				method: 'false'
			};

			nock(endpoint)
				.get('')
				.query(qs)
				.reply(404, {
					error: 'Could not find schema path'
				});

			await assert.rejects(() => routerFetcher.getEndpoint('false', 'false', 'false'), { name: 'MicroServiceCallInvalidService' });
		});

		it('should return the endpoint and the httpMethod when the router returns 200', async() => {
			const qs = {
				service: 'true',
				namespace: 'true',
				method: 'true'
			};

			const mockedMicroservice = {
				endpoint: 'http://localhost/foo/bar',
				httpMethod: 'GET'
			};

			nock(endpoint)
				.get('')
				.query(qs)
				.reply(200, mockedMicroservice);


			const response = await routerFetcher.getEndpoint('true', 'true', 'true');

			assert.deepStrictEqual(response, mockedMicroservice);
		});

		it('should send httpMethod in the query params to the router if is passed to `getEndpoint` method.', async() => {
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

			nock(endpoint)
				.get('')
				.query(qs)
				.reply(200, mockedMicroservice);

			await routerFetcher.getEndpoint('true', 'true', 'true', 'method');
		});

		it('should return a generic error when request library cannot make the call to the ms.', async() => {

			sandbox.stub(request, 'Request').callsFake(({ callback }) => {
				callback(new Error('fatal error'));
			});

			assert.rejects(() => routerFetcher.getEndpoint(), { message: 'fatal error' });
		});

		it('should call the route fetcher without "Janis-Client"', async() => {

			const routerFetcherWithoutJanisClient = new RouterFetcher();

			const qs = {
				service: 'true',
				namespace: 'true',
				method: 'true'
			};


			nock(endpoint, {
				badheaders: ['Janis-Client']
			})
				.get('')
				.query(qs)
				.reply(200, {
					message: 'all good.'
				});

			await routerFetcherWithoutJanisClient.getEndpoint('true', 'true', 'true');
		});

	});

	describe('getSchema', () => {

		it('should return an MicroServiceCallInvalidService error when the router returns >= 400 status code.', async() => {

			const serviceName = 'false';

			nock(schema.replace('{serviceName}', serviceName))
				.get('')
				.reply(404, {
					error: 'Could not find schema path'
				});

			await assert.rejects(() => routerFetcher.getSchema(serviceName), { name: 'MicroServiceCallInvalidService' });
		});

		it('should return the schema when the router returns 200', async() => {

			const mockedResponse = {
				servers: [{}, {}],
				tags: [],
				paths: {}
			};

			const serviceName = 'foo';

			nock(schema.replace('{serviceName}', serviceName))
				.get('')
				.reply(200, mockedResponse);

			const response = await routerFetcher.getSchema(serviceName);

			assert.deepStrictEqual(response, mockedResponse);
		});

		it('should return a generic error when request library cannot make the call to the ms.', async() => {

			sandbox.stub(request, 'Request').callsFake(({ callback }) => {
				callback(new Error('fatal error'));
			});

			assert.rejects(() => routerFetcher.getSchema(), { message: 'fatal error' });
		});
	});

});
