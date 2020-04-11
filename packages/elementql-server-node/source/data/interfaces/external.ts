import {
    CompilerOptions,
} from 'typescript';



export interface ElementQLServerOptions {
    schema: any;
    resolvers: any;
    port?: number;
    buildDirectory?: string;
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
    options?: CompilerOptions;
}


export interface PluginMinimizeOptions {
    /**
     * Default: true
     */
    mangle: boolean;
}

export interface ElementQLServerMinimize extends ElementQLServerPluginBase {
    kind: 'minimize';
    options?: PluginMinimizeOptions;
}


export type ElementQLServerPlugin = ElementQLServerTypescript | ElementQLServerMinimize;
