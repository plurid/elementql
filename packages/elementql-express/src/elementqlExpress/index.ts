import express from 'express';

import {
    ENDPOINT,
} from '../constants';

import {
    ElementQLExpressOptions,
} from '../interfaces';



const elementqlExpress = (
    options: ElementQLExpressOptions
) => (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
) => {
    if (options.verbose) {
        console.log('ElementQL Express middleware installed.');
    }

    let endpoint = ENDPOINT;
    if (options.endpoint) {
        endpoint = options.endpoint;
    }

    if (request.url === endpoint) {
        console.log('Serving ElementQL');
    }

    next();
}


export default elementqlExpress;
