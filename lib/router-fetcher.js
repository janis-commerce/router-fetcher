'use strict';

const { promisify } = require('util');
const request = promisify(require('request'));
const Settings = require('@janiscommerce/settings');
const RouterFetcherError = require('./router-fetcher-error');

const API_KEY = 'apiKey';
const ROUTER_CONFIG = 'routerConfig';
/**
 * Response of the router.
 * @typedef {Object} RouterResponse
 * @param {String} endpoint The endpoint of microservice.
 * @param {String} httpMethod The httpMethod of endpoint.
 */

/**
 * @class RouterFetcher
 * @classdesc Use this to make request to the router.
 */
class RouterFetcher {

	static get apiKeyField() {
		return API_KEY;
	}

	static get routerConfigField() {
		return ROUTER_CONFIG;
	}

	get apiKey() {

		if(!this._apiKey) {
			const apiKey = Settings.get(this.constructor.apiKeyField);
			if(!apiKey)
				throw new RouterFetcherError('Invalid Api Key Settings', RouterFetcherError.codes.INVALID_API_KEY_SETTING);
			this._apiKey = apiKey;
		}
		return this._apiKey;
	}

	get routerConfig() {
		if(!this._routerConfig) {
			const routerConfig = Settings.get(this.constructor.routerConfigField);
			if(!routerConfig)
				throw new RouterFetcherError('Invalid Router Config Settings', RouterFetcherError.codes.INVALID_ROUTER_CONFIG_SETTING);

			this._routerConfig = routerConfig;
		}

		return this._routerConfig;
	}

	get endpoint() {
		if(!this.routerConfig.endpoint)
			throw new RouterFetcherError('Invalid Router Config Settings. Invalid Endpoint', RouterFetcherError.codes.INVALID_ROUTER_CONFIG_SETTING);
		return this.routerConfig.endpoint;
	}

	get schema() {
		if(!this.routerConfig.schema)
			throw new RouterFetcherError('Invalid Router Config Settings. Invalid Schema', RouterFetcherError.codes.INVALID_ROUTER_CONFIG_SETTING);
		return this.routerConfig.schema;
	}

	/**
	 * Get the endpoint data doing one request to the router.
	 * @param  {String} service The name of the microservice.
	 * @param  {String} namespace The namespace of the microservice.
	 * @param  {String} method The method of microservice.
	 * @param  {String} httpMethod Verb of the request.
	 * @return {Promise<RouterResponse>}
	 */

	async getEndpoint(service, namespace, method, httpMethod) {

		const { apiKey, endpoint } = this;
		const qs = { namespace, method, service };

		if(httpMethod)
			qs.httpMethod = httpMethod;

		const requestHeaders = {
			'Content-Type': 'application/json',
			'x-api-key': apiKey
		};

		try {
			const { body, statusCode } = await request({
				url: endpoint,
				headers: requestHeaders,
				qs,
				method: 'GET',
				json: true
			});

			if(statusCode >= 400)
				throw new RouterFetcherError('Endpoint not found', RouterFetcherError.codes.ENDPOINT_NOT_FOUND);

			return body;

		} catch(error) {

			if(error.name === 'RouterFetcherError')
				throw error;
			throw new RouterFetcherError(error, RouterFetcherError.codes.REQUEST_LIB_ERROR);
		}
	}

	/**
	 * Get the schema data of a service doing one request to the router.
	 * @param  {String} service The name of the microservice.
	 * @return {Promise<RouterResponse>}
	 */

	async getSchema(service) {

		const { apiKey, schema } = this;

		const requestHeaders = {
			'Content-Type': 'application/json',
			'x-api-key': apiKey
		};

		try {
			const { body, statusCode } = await request({
				url: schema.replace('{serviceName}', service),
				headers: requestHeaders,
				method: 'GET',
				json: true
			});

			if(statusCode >= 400)
				throw new RouterFetcherError('Schema not found', RouterFetcherError.codes.SCHEMA_NOT_FOUND);

			return body;


		} catch(error) {

			if(error.name === 'RouterFetcherError')
				throw error;

			throw new RouterFetcherError(error.message, RouterFetcherError.codes.REQUEST_LIB_ERROR);
		}
	}
}

module.exports = RouterFetcher;