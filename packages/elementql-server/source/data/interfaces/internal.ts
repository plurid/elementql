import {
    ElementQLServerOptions
} from './external';



export interface IElementQLServer {
    start: () => void;
    stop: () => void;
}

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
