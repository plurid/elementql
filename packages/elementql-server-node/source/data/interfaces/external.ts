import {
    IncomingMessage,
} from 'http';

import {
    CompilerOptions,
} from 'typescript';

import Terser from 'terser';



export interface ElementQLServerOptions {
    protocol?: string;
    domain?: string;
    port?: number;

    /**
     * The mounting root for the file system.
     *
     * On a single process defaults to `process.cwd()`.
     * On Kubernetes is a persistent volume.
     * On a networked process defaults to `/`.
     */
    rootDirectory?: string;
    buildDirectory?: string;                                    /** relative to the root directory */
    nodeModulesDirectory?: string;                              /** relative to the build directory */
    elementqlDirectory?: string;                                /** relative to the root directory */
    transpilesDirectory?: string;                               /** relative to the elementql directory */

    elementsDirectories?: string[];                             /** relative to the build directory */
    libraries?: Partial<LibrariesResolvers>;
    endpoint?: string;
    allowOrigin?: string[]
    allowHeaders?: string[];
    plugins?: ElementQLServerPluginKind[] | ElementQLServerPlugin[];

    verbose?: boolean;
    open?: boolean;
    playground?: boolean;
    playgroundEndpoint?: string;
    favicon?: string;
    html?: (message: string) => string;
    logger?: (request: IncomingMessage) => void;

    /**
     * To be used to store/access the elements files in a network location
     */
    store?: ElementQLStore | null;
    metadataFilename?: string;
}

export interface ElementQLStore {
    /** Upload a file to the store */
    upload: (filename: string, buffer: Buffer) => Promise<boolean>;

    /**
     * Request a file from the store.
     *
     * Download is also called at instantiation and it expects from the store the metadata file,
     * default named `metadata.json`, of the already registered elements, if any.
     */
    download: (filename: string) => Promise<Buffer>;
}


export interface ElementQLJSONSystemPropertiesTranspile {
    target: string;
}

export interface ElementQLJSONSystemProperties {
    transpile: Partial<ElementQLJSONSystemPropertiesTranspile>;
}

export type ElementQLJSONProperties = Partial<ElementQLJSONSystemProperties> & Record<string, any>;

export interface ElementQLJSON {
    name: string;
    properties?: ElementQLJSONProperties;
}

export type ElementQLJSONRequest = {
    elements: ElementQLJSON[];
}


export interface ElementQLResponse {
    name: string;
    files: ElementQLResponseFile[];
}

export interface ElementQLResponseFile {
    type: string;
    url: string;
}


export type ElementQLServerPluginKind = 'typescript' | 'babel' | 'minify';

export interface ElementQLServerPluginBase {
    kind: ElementQLServerPluginKind;
}


export interface ElementQLServerTypescript extends ElementQLServerPluginBase {
    kind: 'typescript';
    /**
     * Typescript compiler options
     * https://www.typescriptlang.org/docs/handbook/compiler-options.html
     */
    options?: CompilerOptions;
}


export interface ElementQLServerBabel extends ElementQLServerPluginBase {
    kind: 'minify';
    /**
     * Babel options
     */
    options?: any;
}


export interface ElementQLServerMinify extends ElementQLServerPluginBase {
    kind: 'minify';
    /**
     * Terser options
     * https://github.com/terser/terser#minify-options
     */
    options?: Terser.MinifyOptions;
}


export type ElementQLServerPlugin =
    | ElementQLServerTypescript
    | ElementQLServerBabel
    | ElementQLServerMinify;


export type LibrariesResolvers = Record<Libraries, LibraryResolver>;

export interface LibraryResolver {
    version?: string;
    module: boolean;
    development: string,
    production: string,
}

export type Libraries =
    | 'react'
    | 'react-dom';
