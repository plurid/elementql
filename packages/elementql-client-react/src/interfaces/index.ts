export interface ElementQLClientReact {
    get: (elementLiteral: any) => Promise<any>;
}


export interface ElementQLClientReactOptions {
    url: string;
}


declare global {
    interface Window {
        elementQL: any;
    }
}
