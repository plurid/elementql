export interface IElementQLServer {
    start: () => void;
    stop: () => void;
}


export interface ElementQLServerOptions {
    schema: any;
    resolvers: any;
    port?: number;
    elementsPaths?: string;
    endpoint?: string;
    allowOrigin?: string | string[]
    allowHeaders?: string;
    plugins?: string[];
    verbose?: boolean;
    open?: boolean;
    playground?: boolean;
    playgroundEndpoint?: string;
}

export type InternalElementQLServerOptions = Required<ElementQLServerOptions>


export interface ElementQLServerStartOptions {
    open: boolean;
}


export interface RegisteredElementQL {
    id: string;
    name: string;
    routes: {
        js: string;
        css: string;
    },
    paths: {
        js: string;
        css: string;
    }
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
    properties: ElementQLJSONProperties;
}

export type ElementQLJSONRequest = {
    elements: ElementQLJSON[];
}
