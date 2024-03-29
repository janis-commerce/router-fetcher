# router-fetcher

![Build Status](https://github.com/janis-commerce/router-fetcher/workflows/Build%20Status/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/router-fetcher/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/router-fetcher?branch=master)
[![npm version](https://badge.fury.io/js/%40janiscommerce%2Frouter-fetcher.svg)](https://www.npmjs.com/package/@janiscommerce/router-fetcher)

Maps services names, namespaces and methods defined in the API's schemas, to endpoints and HTTP methods for APIs's calls from any service.

## Instalation

```
npm install @janiscommerce/router-fetcher
```

## Configuration

`Router-Fetcher` uses a setting JSON file.

It's located in `path/to/root/[MS_PATH]/config/.janiscommercerc.json`

Needs the following fields

- `routerConfig`, `object` with URL to get Endpoints and Schemas.

### Example

In `path/to/root/[MS_PATH]/config/.janiscommercerc.json.`

```JSON
{
	"routerConfig": {
		"endpoint": "http://valid-router:7999/api/endpoint",
		"schema": "http://valid-router:7999/api/services/{serviceName}/schema"
	}
}
```

## API

* `new RouterFetcher()`

    Router-Fetcher Constructors

* `getEndpoint(service, namespace, method, httpMethod)`

    Get the endpoint data doing one request to the router.

    - `service`:
        - type `String`
        - The name of the microservice.
	- `namespace`
        - type `String`
        - The namespace of the microservice.
	- `method`
        - type `String`
        - The method of microservice.
	- `httpMethod`
        - type `String`
        - Verb of the request.

    Returns a `Promise` of `RouterResponse` object

* `getSchema(service)`

    Get the schema data of a service doing one request to the router.

    - `service`:
        - type `String`
        - The name of the microservice.

    Returns a `Promise` of `RouterResponse` object

## Response Object

Response of Router for endpoints

* `RouterResponse`
    * `endpoint`
        * type: `String`
        * The endpoint of microservice.
    * `httpMethod`
        * type: `String`
        * The httpMethod of endpoint.

For `Schemas` requests, the response will be an `object` with the [OpenAPI specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md)

## Errors

The errors are informed with a `RouterFetcherError`.

* `RouterFetcherError`:
    * `code`:
        * type: `Number`
        * The status code of the error
    * `message`:
        * type: `String`
        * The status message of the response.
    * `name`:
        * type: `String`
        * value:
            * `RouterFetcherError`. If the response code is >= 400.
            * Other, Request Library Error.


### Codes

The codes are the following:

|Code	|Description						|
|-----|-----------------------------|
|2		|Schema not found 				|
|3		|Invalid Router Config Path 		|
|4		|Endpoint not found 				|
|5		|Request Library Errors 	|

## Usage

Make a request to "SAC" microservice with the namespace "claim-type" and method "list" and get its endpoints.

```javascript
const RouterFetcher = require('@janiscommerce/router-fetcher');

const routerFetcher = new RouterFetcher();

try {

    const response = await routerFetcher.getEndpoint('sac', 'claim-type', 'list');

    /*
        Response example
        {
            "endpoint": "https://sac.janis.in/claim-types",
            "httpMethod: "GET"
        }
    */

} catch (err) {
    /*
        Error Response Example:
        {
            name: 'RouterFetcherError'
            message: 'Endpoint not found',
            code: 3
        }
    */
    if (err.name === `RouterFetcherError`) {
        // The code of the router response is >= 400.

    } else {
        // Fatal error of request library https://www.npmjs.com/package/request
    }
}
```

Make a request to "SAC" microservice and obtain its schemas.

```javascript
const RouterFetcher = require('@janiscommerce/router-fetcher');

const routerFetcher = new RouterFetcher();

try {

    const response = await routerFetcher.getSchema('sac');

    /*
        Response example
        {
            servers: ["core"],
            tags: ["sac"],
            paths: {
                /sac/claim-type/list:
                    x-janis-namespace: claim-type,
                    x-janis-method: "list",
                    get: {
                        responses: {
                        '200': description: OK,
                        '400': description: Invalid parameters,
                        '401': description: Invalid authentication,
                        '403': description: Invalid permissions
                        }
                    }
                }
        }
    */

} catch(err) {
    /*
        Error Response Example:
        {
            name: 'RouterFetcherError'
            message: 'Schema not found',
            code: 2
        }
    */
    if(err.name === `RouterFetcherError`) {
        // The code of the router response is >= 400.

    } else {
        // Fatal error of request library https://www.npmjs.com/package/request
    }
}
```