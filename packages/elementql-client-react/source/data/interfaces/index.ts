// #region imports
    // #region libraries
    import {
        ElementQLElements,
    } from '@plurid/elementql-client';
    // #endregion libraries
// #endregion imports



// #region module
export interface ElementQLClientOptions {
    url: string;

    /**
     * Wait for Elements to be loaded on window (in milliseconds).
     *
     * Default `100`.
     */
    loadTimeout?: number;

    /**
     * Name of the object onto which elements are recorded on window.
     *
     * Default `elementql`.
     */
    recordObject?: string;
}

export type InternalElementQLClientOptions = Required<ElementQLClientOptions>;


export interface ElementQLGetOptions {
    loadTimeout?: number;
    recordObject?: string;
}


declare global {
    interface Window {
        elementql: ElementQLElements<React.FC<any>>;
    }
}
// #endregion module
