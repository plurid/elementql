import {
    CompilerOptions,
} from 'typescript';

import Terser from 'terser';



export interface ElementQLServerOptions {
    port?: number;
    buildDirectory?: string;
    elementqlDirectory?: string;
    transpilesDirectory?: string;
    elementsPaths?: string | string[];
    libraries?: Record<string, string | ElementQLLibray>;
    endpoint?: string;
    allowOrigin?: string | string[]
    allowHeaders?: string;
    plugins?: ElementQLServerPluginKind[] | ElementQLServerPlugin[];
    verbose?: boolean;
    open?: boolean;
    playground?: boolean;
    playgroundEndpoint?: string;

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


export interface ElementQLLibray {
    version?: string;
    file?: string;
    link?: string;
}
