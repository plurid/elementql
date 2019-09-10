export interface ElementQLClient {
    get: (elementLiteral: any) => Promise<any>;
}


export interface ElementQLClientOptions {
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
