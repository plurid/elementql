import {
    ElementQLServerOptions,
} from './external';



export type InternalElementQLServerOptions = Required<ElementQLServerOptions>;


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
    name: string;
    type: string;
    path: string;
    imports: ElementQLFileImport[];
}


export interface ProcessedElementQLTranspile {
    id: string;
    sourceID: string;
    name: string;
    type: string;
    path: string;
    url: string;
}


export interface ElementQLFileImport {
    relative: boolean;
    library: boolean;
    value: string;
}



export interface ElementQLMetadataFile {
    elements: ElementQL[];
    generatedAt: number;
}


export type ElementQLID = string;
