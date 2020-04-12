import path from 'path';

import {
    ElementQLServerPluginKind,
} from '../interfaces';



export const isProduction = process.env.ENV_MODE === 'production';

export const DEFAULT_PROTOCOL = isProduction ? 'https' : 'http';
export const DEFAULT_DOMAIN = isProduction ? '' : 'localhost';
const PROCESS_ENV_PORT = process.env.PORT ? parseInt(process.env.PORT) : 21100;
export const DEFAULT_PORT = isProduction ? PROCESS_ENV_PORT : 21100;

export const DEFAULT_ELEMENTQL_ROOT_DIRECTORY = process.cwd();
export const DEFAULT_ELEMENTQL_BUILD_DIRECTORY = 'build';
export const DEFAULT_ELEMENTQL_NODE_MODULES_DIRECTORY = 'node_modules';
export const DEFAULT_ELEMENTQL_ELEMENTQL_DIRECTORY = '.elementql';
export const DEFAULT_ELEMENTQL_TRANSPILES_DIRECTORY = 'transpiles';

export const DEFAULT_ELEMENTS_DIRECTORIES = ['elements'];
export const DEFAULT_LIBRARIES = {};
export const DEFAULT_ENDPOINT = '/elementql';
export const DEFAULT_ALLOW_ORIGIN = ['*'];
export const DEFAULT_ALLOW_HEADERS = ['*'];
export const DEFAULT_PLUGINS: ElementQLServerPluginKind[] = isProduction ? ['minify'] : [];

export const DEFAULT_VERBOSE = true;
export const DEFAULT_OPEN = isProduction ? false : true;
export const DEFAULT_PLAYGROUND = isProduction ? false : true;
export const DEFAULT_PLAYGROUND_ENDPOINT = '/playground';

export const DEFAULT_STORE = null;
export const DEFAULT_METADATA_FILENAME = 'metadata.json';

export const FAVICON = path.join(__dirname, './assets', 'favicon.ico');


export const METHOD_GET = 'GET';
export const METHOD_POST = 'POST';

export const HEADER_CONTENT_TYPE = 'content-type';

export const APPLICATION_ELEMENTQL = 'application/elementql';
export const APPLICATION_JSON = 'application/json';

export const HTTP_OK = 200;
export const HTTP_BAD_REQUEST = 400;
export const HTTP_NOT_FOUND = 404;
export const HTTP_METHOD_NOT_ALLOWED = 405;
export const HTTP_UNSUPPORTED_MEDIA_TYPE = 415;
