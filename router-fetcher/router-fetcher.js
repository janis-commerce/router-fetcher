'use strict';

const request = require('request');
const apiKey = require('./../config/api-key');
const { endpoint, schema } = require('./../config/router');

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

	/**
	 * Get the endpoint data doing one request to the router.
	 * @param  {String} service The name of the microservice.
	 * @param  {String} namespace The namespace of the microservice.
	 * @param  {String} method The method of microservice.
	 * @param  {String} httpMethod Verb of the request.
	 * @return {Promise<RouterResponse>}
	 */

	getEndpoint(service, namespace, method, httpMethod) {
		const qs = { namespace, method, service };

		if(httpMethod)
			qs.httpMethod = httpMethod;

		const requestHeaders = {
			'Content-Type': 'application/json',
			'x-api-key': apiKey
		};

		return new Promise((resolve, reject) => {
			request({
				url: endpoint,
				headers: requestHeaders,
				qs,
				method: 'GET',
				json: true
			}, (err, httpResponse, body) => {
				if(err)
					return reject(err);

				if(httpResponse.statusCode >= 400) {
					const { headers, statusCode, statusMessage } = httpResponse;
					return reject(new RouterFetcherError(statusCode, statusMessage, headers, body));
				}

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

		const requestHeaders = {
			'Content-Type': 'application/json',
			'x-api-key': apiKey
		};

		return new Promise((resolve, reject) => {
			request({
				url: schema.replace('{serviceName}', service),
				headers: requestHeaders,
				method: 'GET',
				json: true
			}, (err, httpResponse, body) => {

				if(err)
					return reject(err);

				if(httpResponse.statusCode >= 400) {
					const { headers, statusCode, statusMessage } = httpResponse;
					return reject(new RouterFetcherError(statusCode, statusMessage, headers, body));
				}

				resolve(body);
			});
		});
	}
}

module.exports = RouterFetcher;