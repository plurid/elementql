export interface ElementQLClientReactOptions {
    url: string;
}

export type InternalElementQLClientReactOptions = Required<ElementQLClientReactOptions>;


export interface ElementQLElements {
    [key: string]: any;
}


declare global {
    interface Window {
        elementql: ElementQLElements;
    }
}
