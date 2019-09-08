export interface IElementQLServer {
    start: () => void;
    stop: () => void;
}


export interface ElementQLServerOptions {
    port?: number;
    verbose?: boolean;
    elementsDir?: string;
    plugins?: string[];
    endpoint?: string;
    playground?: boolean;
    playgroundURL?: string;
}


export interface ElementQLServerStartOptions {
    open: boolean;
}


export interface RegisteredElementQL {
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
