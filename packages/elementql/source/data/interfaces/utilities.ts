export interface BootloaderConfiguration {
    globals: Record<string, string>;
    origins: BootloaderConfigurationOrigins;
    entry: string;
}

export interface BootloaderConfigurationOrigins {
    elementql: string;
    application: string;
}


export interface UseLibrariesOptions {
    libraries: Record<string, any>;
    buildDirectory: string;
};
