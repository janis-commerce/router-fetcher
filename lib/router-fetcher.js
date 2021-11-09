'use strict';

const axios = require('axios');
const Settings = require('@janiscommerce/settings');
const RouterFetcherError = require('./router-fetcher-error');

const ROUTER_CONFIG = 'routerConfig';

/**
* Response of the router.
* @typedef {Object} RouterResponse
* @property {string} endpoint - The endpoint of microservice.
* @property {string} httpMethod - The httpMethod of endpoint.
*/

/**
*A Router Config.
* @typedef {Object} RouterConfig
* @property {string} endpoint - The endpoint to request.
* @property {string} schema - The schema endpoint.
*/

/**
 * @class RouterFetcher
 * @classdesc Use this to make request to the router.
 */
module.exports = class RouterFetcher {

	static get routerConfigField() {
		return ROUTER_CONFIG;
	}

	/**
	 * Get the routerConfig
	 * @return {RouterConfig}
	 */
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

	/**
	 * Get endpoint of routerConfig
	 * @return {string | RouterFetcherError}
	 */
	get endpoint() {
		if(!this.routerConfig.endpoint)
			throw new RouterFetcherError('Invalid router config settings. Missing endpoint URL.', RouterFetcherError.codes.INVALID_ROUTER_CONFIG_SETTING);
		return this.routerConfig.endpoint;
	}

	/**
	 * Get schema of routerConfig
	 * @return {string | RouterFetcherError}
	 */
	get schema() {
		if(!this.routerConfig.schema)
			throw new RouterFetcherError('Invalid router config settings. Missing schema URL.', RouterFetcherError.codes.INVALID_ROUTER_CONFIG_SETTING);
		return this.routerConfig.schema;
	}

	/**
	 * Get the axios instance
	 * @return {import("axios").Axios}
	 */
	get axiosInstance() {

		if(!this._axiosInstance) {
			this._axiosInstance = axios.create({
				headers: { 'content-type': 'application/json' },
				responseType: 'json',
				validateStatus: () => true
			});
		}

		return this._axiosInstance;
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

		const { endpoint, axiosInstance } = this;
		const params = { namespace, method, service };

		if(httpMethod)
			params.httpMethod = httpMethod;

		try {

			const { data, status } = await axiosInstance.get(endpoint, {
				params
			});

			if(status >= 400)
				throw new RouterFetcherError(`Endpoint not found: ${service} - ${namespace} - ${method}`, RouterFetcherError.codes.ENDPOINT_NOT_FOUND);

			return data;

		} catch(error) {

			if(error.name === 'RouterFetcherError')
				throw error;

			throw new RouterFetcherError(error, RouterFetcherError.codes.REQUEST_LIB_ERROR);
		}
	}

	/**
	 * Get the schema data of a service doing one request to the router.
	 * @param  {String} service The name of the microservice.
	 * @return {Object | RouterFetcherError} The service schema
	 */
	async getSchema(service) {

		const { schema, axiosInstance } = this;

		try {

			const { data, status } = await axiosInstance.get(schema.replace('{serviceName}', service));

			if(status >= 400)
				throw new RouterFetcherError(`Schema not found for service '${service}'`, RouterFetcherError.codes.SCHEMA_NOT_FOUND);

			return data;

		} catch(error) {

			if(error.name === 'RouterFetcherError')
				throw error;

			throw new RouterFetcherError(error, RouterFetcherError.codes.REQUEST_LIB_ERROR);
		}
	}
};
