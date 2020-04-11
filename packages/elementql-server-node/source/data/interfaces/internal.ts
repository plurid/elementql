import {
    ElementQLServerOptions
} from './external';



export type InternalElementQLServerOptions = Required<ElementQLServerOptions>;


export interface RegisteredElementQL {
    id: string;
    name: string;
    routes: RegisteredElementQLRoute[];
}

export interface RegisteredElementQLRoute {
    fileType: string;
    filePath: string;
    url: string;
}



export interface ProcessedElementQL {
    id: string;
    name: string;
    files: Record<string, ProcessedElementQLFile>;
}

export interface TranspiledElementQL {
    transpiles: Record<string, ProcessedElementQLTranspile>
}

export type ElementQL = ProcessedElementQL & TranspiledElementQL;


export interface ProcessedElementQLFile {
    id: string;
    fileType: string;
    filePath: string;
}


export interface ProcessedElementQLTranspile {
    fileType: string;
    filePath: string;
}
