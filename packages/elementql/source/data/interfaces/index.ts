export interface IElementQL {

}


export interface ElementQLOptions {

}


export interface BootloaderConfiguration {
    globals: Record<string, string>,
    origins: {
        elementql: string,
        application: string,
    },
    entry: string,
}


export interface UseLibrariesOptions {
    libraries: Record<string, any>;
    buildDirectory: string;
};
