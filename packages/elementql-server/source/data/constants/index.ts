import path from 'path';

import {
    ElementQLServerStartOptions,
} from '../interfaces';



export const defaultServerStartOptions: ElementQLServerStartOptions = {
    open: true,
};


export const DEFAULT_PORT = 33300;

export const DEFAULT_ELEMENTS_DIR = '/elements';

export const DEFAULT_ELEMENTQL_ENDPOINT = '/elementql';
export const DEFAULT_PLAYGROUND_ENDPOINT = '/playground';

export const FAVICON = path.join(__dirname, './assets', 'favicon.ico');


export const METHOD_GET = 'GET';
export const METHOD_POST = 'POST';

export const HEADER_CONTENT_TYPE = 'Content-Type';

export const APPLICATION_ELEMENTQL = 'application/elementql';
export const APPLICATION_JSON = 'application/json';

export const HTTP_METHOD_NOT_ALLOWED = 405;
export const HTTP_UNSUPPORTED_MEDIA_TYPE = 415;
