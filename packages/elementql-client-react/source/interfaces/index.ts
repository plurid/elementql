export interface ElementQLClientReact {
    get: (elementLiteral: any) => Promise<any>;
}


export interface ElementQLClientReactOptions {
    url: string;
}


export interface ElementQLElements {
    [key: string]: any;
}


declare global {
    interface Window {
        elementql: ElementQLElements;
    }
}
