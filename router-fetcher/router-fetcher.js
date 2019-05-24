'use strict';

const path = require('path');
const request = require('request');
const RouterFetcherError = require('./router-fetcher-error');

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

	static get apiKeyPath() {
		return path.join(process.cwd(), 'config/api-key');
	}

	static get routerConfigPath() {
		return path.join(process.cwd(), 'config/router');
	}

	_cacheApiKey() {

		let apiKey;

		try {
			/* eslint-disable global-require, import/no-dynamic-require */
			apiKey = require(this.constructor.apiKeyPath);
		} catch(error) {
			throw new RouterFetcherError('Invalid api key path', RouterFetcherError.codes.INVALID_API_KEY_PATH);
		}

		this.apiKey = apiKey;

	}

	_cacheRouterConfig() {

		try {
			/* eslint-disable global-require, import/no-dynamic-require */
			const { endpoint, schema } = require(this.constructor.routerConfigPath);
			this.endpoint = endpoint;
			this.schema = schema;
		} catch(error) {
			throw new RouterFetcherError('Invalid router config path', RouterFetcherError.codes.INVALID_ROUTER_CONFIG_PATH);
		}
	}

	get config() {

		if(!this.apiKey)
			this._cacheApiKey();

		if(!this.endpoint || !this.schema)
			this._cacheRouterConfig();

		return {
			apiKey: this.apiKey,
			endpoint: this.endpoint,
			schema: this.schema
		};
	}

	/**
	 * Get the endpoint data doing one request to the router.
	 * @param  {String} service The name of the microservice.
	 * @param  {String} namespace The namespace of the microservice.
	 * @param  {String} method The method of microservice.
	 * @param  {String} httpMethod Verb of the request.
	 * @return {Promise<RouterResponse>}
	 */

	getEndpoint(service, namespace, method, httpMethod) {

		return new Promise((resolve, reject) => {

			const { apiKey, endpoint } = this.config;

			const qs = { namespace, method, service };

			if(httpMethod)
				qs.httpMethod = httpMethod;

			const requestHeaders = {
				'Content-Type': 'application/json',
				'x-api-key': apiKey
			};

			request({
				url: endpoint,
				headers: requestHeaders,
				qs,
				method: 'GET',
				json: true
			}, (err, httpResponse, body) => {

				if(err)
					return reject(new RouterFetcherError(err, RouterFetcherError.codes.REQUEST_LIB_ERROR));

				if(httpResponse.statusCode >= 400)
					return reject(new RouterFetcherError('Endpoint not found', RouterFetcherError.codes.ENDPOINT_NOT_FOUND));

				resolve(body);
			});
		});
	}

	/**
	 * Get the schema data of a service doing one request to the router.
	 * @param  {String} service The name of the microservice.
	 * @return {Promise<RouterResponse>}
	 */

	getSchema(service) {

		return new Promise((resolve, reject) => {

			const { apiKey, schema } = this.config;

			const requestHeaders = {
				'Content-Type': 'application/json',
				'x-api-key': apiKey
			};

			request({
				url: schema.replace('{serviceName}', service),
				headers: requestHeaders,
				method: 'GET',
				json: true
			}, (err, httpResponse, body) => {

				if(err)
					return reject(new RouterFetcherError(err, RouterFetcherError.codes.REQUEST_LIB_ERROR));

				if(httpResponse.statusCode >= 400)
					return reject(new RouterFetcherError('Schema not found', RouterFetcherError.codes.SCHEMA_NOT_FOUND));

				resolve(body);
			});
		});
	}
}

module.exports = RouterFetcher;
