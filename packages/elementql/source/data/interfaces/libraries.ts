export type Libraries = Record<LibraryName, LibraryResolver>;


export interface LibraryResolver {
    version?: string;
    module: boolean;
    development: string,
    production: string,
}


export type LibraryName =
    | 'react'
    | 'reactDom';
