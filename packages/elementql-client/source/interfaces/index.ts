// #region module
export interface ElementQLClientOptions {
    url: string;
}


export type ElementQLElements<C = any> = Record<string, C>;


export type ElementQLWindow = typeof window & {
    elementql: ElementQLElements;
};
// #endregion module
