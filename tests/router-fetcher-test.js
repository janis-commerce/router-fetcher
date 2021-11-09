'use strict';

const nock = require('nock');
const assert = require('assert');
const sinon = require('sinon');
const { Axios } = require('axios');

const Settings = require('@janiscommerce/settings');

const RouterFetcher = require('../');
const RouterFetcherError = require('../lib/router-fetcher-error');

const sandbox = sinon.createSandbox();

describe('RouterFetcher module.', () => {

	const validRouter = {
		endpoint: 'http://valid-router:3014/api/endpoint',
		schema: 'http://valid-router:3014/api/services/{serviceName}/schema'
	};

	let settingsStub;
	let routerFetcher;

	describe('getEndpoint', () => {

		beforeEach(() => {
			routerFetcher = new RouterFetcher();
			settingsStub = sandbox.stub(Settings, 'get');
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('should return Error with invalid router-config setting when \'routerConfig\' field don\'t exist in settings file', async() => {

			await assert.rejects(() => routerFetcher.getEndpoint('any', 'any', 'any'),
				{ name: 'RouterFetcherError', code: RouterFetcherError.codes.INVALID_ROUTER_CONFIG_SETTING });

		});

		it('should return Error with invalid endpoint when \'routerConfig\' don\'t have \'endpoint\' field ', async() => {

			settingsStub.withArgs(RouterFetcher.routerConfigField)
				.returns({
					schema: validRouter.schema
				});

			await assert.rejects(routerFetcher.getEndpoint('any', 'any', 'any'),
				{ name: 'RouterFetcherError', code: RouterFetcherError.codes.INVALID_ROUTER_CONFIG_SETTING });

		});

		it('should return the endpoint and the httpMethod when the router returns 200', async() => {

			settingsStub.withArgs(RouterFetcher.routerConfigField)
				.returns(validRouter);

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

			settingsStub.withArgs(RouterFetcher.routerConfigField)
				.returns(validRouter);

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

			const response = await routerFetcher.getEndpoint('true', 'true', 'true', 'method');

			assert.deepStrictEqual(response, mockedMicroservice);
		});

		it('should return an Error when router can not find the endpoints', async() => {

			settingsStub.withArgs(RouterFetcher.routerConfigField)
				.returns(validRouter);

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

			await assert.rejects(routerFetcher.getEndpoint('false', 'false', 'false'),
				{ name: 'RouterFetcherError', code: RouterFetcherError.codes.ENDPOINT_NOT_FOUND });
		});

		it('should return a generic error when request library cannot make the call to the ms.', async() => {

			settingsStub.withArgs(RouterFetcher.routerConfigField)
				.returns(validRouter);

			sandbox.stub(Axios.prototype, 'request').rejects(new Error('Fatal error'));

			await assert.rejects(routerFetcher.getEndpoint(), { message: 'Fatal error', code: RouterFetcherError.codes.REQUEST_LIB_ERROR });
		});

	});

	describe('getSchema', () => {

		beforeEach(() => {
			routerFetcher = new RouterFetcher();
			settingsStub = sandbox.stub(Settings, 'get');
		});

		afterEach(() => {
			sandbox.restore();
		});

		it('should return Error with invalid endpoint when \'routerConfig\' don\'t have \'schema\' field ', async() => {

			settingsStub.withArgs(RouterFetcher.routerConfigField)
				.returns({
					endpoint: validRouter.endpoint
				});

			const serviceName = 'false';

			await assert.rejects(routerFetcher.getSchema(serviceName),
				{ name: 'RouterFetcherError', code: RouterFetcherError.codes.INVALID_ROUTER_CONFIG_SETTING });
		});

		it('should return an RouterFetcherError when the router returns >= 400 status code.', async() => {

			settingsStub.withArgs(RouterFetcher.routerConfigField)
				.returns(validRouter);

			const serviceName = 'false';

			nock(validRouter.schema.replace('{serviceName}', serviceName))
				.get('')
				.reply(404, {
					error: 'Could not find schemas'
				});

			await assert.rejects(routerFetcher.getSchema(serviceName),
				{ name: 'RouterFetcherError', code: RouterFetcherError.codes.SCHEMA_NOT_FOUND });
		});

		it('should return the schema when the router returns 200', async() => {

			settingsStub.withArgs(RouterFetcher.routerConfigField)
				.returns(validRouter);

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

			settingsStub.withArgs(RouterFetcher.routerConfigField)
				.returns(validRouter);

			sandbox.stub(Axios.prototype, 'request').rejects(new Error('Fatal error'));

			await assert.rejects(routerFetcher.getSchema(), { message: 'Fatal error', code: RouterFetcherError.codes.REQUEST_LIB_ERROR });
		});
	});

	describe('Getters', () => {

		describe('Get Router Config', () => {
			beforeEach(() => {
				routerFetcher = new RouterFetcher();
				settingsStub = sandbox.stub(Settings, 'get');
			});

			afterEach(() => {
				sandbox.restore();
			});

			it('should return routerConfig from Settings', () => {
				settingsStub.withArgs(RouterFetcher.routerConfigField).returns(validRouter);

				assert.deepEqual(routerFetcher.routerConfig, validRouter);
				sandbox.assert.calledOnce(Settings.get);
				sandbox.assert.calledWithExactly(Settings.get.getCall(0), RouterFetcher.routerConfigField);

			});

			it('should return routerConfig from Settings but in a second call should use cache', () => {
				settingsStub.withArgs(RouterFetcher.routerConfigField).returns(validRouter);

				assert.deepEqual(routerFetcher.routerConfig, validRouter);
				assert.deepEqual(routerFetcher.routerConfig, validRouter);

				sandbox.assert.calledOnce(Settings.get);
				sandbox.assert.calledWithExactly(Settings.get.getCall(0), RouterFetcher.routerConfigField);

			});

			it('should throw Error when Settings for routerConfig not exist', () => {
				settingsStub.withArgs(RouterFetcher.routerConfigField).returns();

				assert.throws(() => routerFetcher.routerConfig, { name: 'RouterFetcherError', code: RouterFetcherError.codes.INVALID_ROUTER_CONFIG_SETTING });
				sandbox.assert.calledOnce(Settings.get);
				sandbox.assert.calledWithExactly(Settings.get.getCall(0), RouterFetcher.routerConfigField);

			});
		});

		describe('Get Endpoints', () => {
			beforeEach(() => {
				routerFetcher = new RouterFetcher();
				settingsStub = sandbox.stub(Settings, 'get');
			});

			afterEach(() => {
				sandbox.restore();
			});

			it('should return endpoint from Settings', () => {
				settingsStub.withArgs(RouterFetcher.routerConfigField).returns(validRouter);

				assert.strictEqual(routerFetcher.endpoint, validRouter.endpoint);
				sandbox.assert.calledOnce(Settings.get);
				sandbox.assert.calledWithExactly(Settings.get.getCall(0), RouterFetcher.routerConfigField);
			});

			it('should return endpoint from Settings but in a second call should use cache for router-fetcher', () => {
				settingsStub.withArgs(RouterFetcher.routerConfigField).returns(validRouter);

				assert.strictEqual(routerFetcher.endpoint, validRouter.endpoint);
				assert.strictEqual(routerFetcher.endpoint, validRouter.endpoint);

				sandbox.assert.calledOnce(Settings.get);
				sandbox.assert.calledWithExactly(Settings.get.getCall(0), RouterFetcher.routerConfigField);
			});

			it('should throw Error when Settings for routerConfig not exist', () => {
				settingsStub.withArgs(RouterFetcher.routerConfigField).returns({
					schema: validRouter.schema
				});

				assert.throws(() => routerFetcher.endpoint, { name: 'RouterFetcherError', code: RouterFetcherError.codes.INVALID_ROUTER_CONFIG_SETTING });
				sandbox.assert.calledOnce(Settings.get);
				sandbox.assert.calledWithExactly(Settings.get.getCall(0), RouterFetcher.routerConfigField);
			});
		});

		describe('Get Schema', () => {
			beforeEach(() => {
				routerFetcher = new RouterFetcher();
				settingsStub = sandbox.stub(Settings, 'get');
			});

			afterEach(() => {
				sandbox.restore();
			});

			it('should return schema from Settings', () => {
				settingsStub.withArgs(RouterFetcher.routerConfigField).returns(validRouter);

				assert.strictEqual(routerFetcher.schema, validRouter.schema);
				sandbox.assert.calledOnce(Settings.get);
				sandbox.assert.calledWithExactly(Settings.get.getCall(0), RouterFetcher.routerConfigField);
			});

			it('should return schema from Settings but in a second call should use cache for router-fetcher', () => {
				settingsStub.withArgs(RouterFetcher.routerConfigField).returns(validRouter);

				assert.strictEqual(routerFetcher.schema, validRouter.schema);
				assert.strictEqual(routerFetcher.schema, validRouter.schema);

				sandbox.assert.calledOnce(Settings.get);
				sandbox.assert.calledWithExactly(Settings.get.getCall(0), RouterFetcher.routerConfigField);
			});

			it('should throw Error when Settings for routerConfig not exist', () => {
				settingsStub.withArgs(RouterFetcher.routerConfigField).returns({
					endpoint: validRouter.endpoint
				});

				assert.throws(() => routerFetcher.schema, { name: 'RouterFetcherError', code: RouterFetcherError.codes.INVALID_ROUTER_CONFIG_SETTING });
				sandbox.assert.calledOnce(Settings.get);
				sandbox.assert.calledWithExactly(Settings.get.getCall(0), RouterFetcher.routerConfigField);
			});
		});
	});
});
