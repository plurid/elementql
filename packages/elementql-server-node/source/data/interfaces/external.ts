import {
    CompilerOptions,
} from 'typescript';

import Terser from 'terser';



export interface ElementQLServerOptions {
    schema: any;
    resolvers: any;
    port?: number;
    buildDirectory?: string;
    elementqlDirectory?: string;
    transpilesDirectory?: string;
    elementsPaths?: string | string[];
    endpoint?: string;
    allowOrigin?: string | string[]
    allowHeaders?: string;
    plugins?: ElementQLServerPluginKind[] | ElementQLServerPlugin[];
    verbose?: boolean;
    open?: boolean;
    playground?: boolean;
    playgroundEndpoint?: string;
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


export type ElementQLServerPluginKind = 'typescript' | 'minimize';

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


export interface ElementQLServerMinimize extends ElementQLServerPluginBase {
    kind: 'minimize';
    /**
     * Terser options
     * https://github.com/terser/terser#minify-options
     */
    options?: Terser.MinifyOptions;
}


export type ElementQLServerPlugin = ElementQLServerTypescript | ElementQLServerMinimize;
