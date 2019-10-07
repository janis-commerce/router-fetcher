'use strict';

const { promisify } = require('util');
const request = promisify(require('request'));
const Settings = require('@janiscommerce/settings');
const RouterFetcherError = require('./router-fetcher-error');

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

	static get routerConfigField() {
		return ROUTER_CONFIG;
	}

	get routerConfig() {
		if(!this._routerConfig) {
			const routerConfig = Settings.get(this.constructor.routerConfigField);
			if(!routerConfig) {
				throw new RouterFetcherError(
					`Missing router config setting '${this.constructor.routerConfigField}'`,
					RouterFetcherError.codes.INVALID_ROUTER_CONFIG_SETTING
				);
			}

			this._routerConfig = routerConfig;
		}

		return this._routerConfig;
	}

	get endpoint() {
		if(!this.routerConfig.endpoint)
			throw new RouterFetcherError('Invalid router config settings. Missing endpoint URL.', RouterFetcherError.codes.INVALID_ROUTER_CONFIG_SETTING);
		return this.routerConfig.endpoint;
	}

	get schema() {
		if(!this.routerConfig.schema)
			throw new RouterFetcherError('Invalid router config settings. Missing schema URL.', RouterFetcherError.codes.INVALID_ROUTER_CONFIG_SETTING);
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

		const { endpoint } = this;
		const qs = { namespace, method, service };

		if(httpMethod)
			qs.httpMethod = httpMethod;

		const requestHeaders = {
			'content-type': 'application/json'
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
				throw new RouterFetcherError(`Endpoint not found: ${service} - ${namespace} - ${method}`, RouterFetcherError.codes.ENDPOINT_NOT_FOUND);

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

		const { schema } = this;

		const requestHeaders = {
			'content-type': 'application/json'
		};

		try {
			const { body, statusCode } = await request({
				url: schema.replace('{serviceName}', service),
				headers: requestHeaders,
				method: 'GET',
				json: true
			});

			if(statusCode >= 400)
				throw new RouterFetcherError(`Schema not found for service '${service}'`, RouterFetcherError.codes.SCHEMA_NOT_FOUND);

			return body;


		} catch(error) {

			if(error.name === 'RouterFetcherError')
				throw error;

			throw new RouterFetcherError(error, RouterFetcherError.codes.REQUEST_LIB_ERROR);
		}
	}
}

module.exports = RouterFetcher;
