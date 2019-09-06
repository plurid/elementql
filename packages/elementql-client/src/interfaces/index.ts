export interface ElementQLClient {
    get: (elementLiteral: any) => Promise<any>;
}


export interface ElementQLClientOptions {
    url: string;
}
