// #region module
export interface ElementQLClientOptions {
    url: string;

    /**
     * Wait for Elements to be loaded on window (in milliseconds).
     *
     * Default `700`.
     */
    loadTimeout?: number;
}

export type InternalElementQLClientOptions = Required<ElementQLClientOptions>;


export interface ElementQLElements {
    [key: string]: any;
}


declare global {
    interface Window {
        elementql: ElementQLElements;
    }
}
// #endregion module
