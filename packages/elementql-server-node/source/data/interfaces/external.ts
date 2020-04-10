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
    plugins?: string[];
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


export interface PluginBase {
    kind: 'typescript';
}


export interface PluginTypescript extends PluginBase {
    kind: 'typescript';
    compilerOptions?: CompilerOptions;
}


export type Plugin = PluginTypescript;
