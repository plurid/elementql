export interface IElementQLServer {
    start: () => void;
    stop: () => void;
}


export interface ElementQLServerOptions {
    port?: number;
    verbose?: boolean;
}


export interface ElementQLServerStartOptions {
    open: boolean;
}
