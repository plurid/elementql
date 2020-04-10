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
