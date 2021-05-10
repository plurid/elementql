// #region imports
    // #region external
    import {
        BootloaderConfiguration,
    } from '../../../data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const bootloader = async (
    configuration: BootloaderConfiguration,
) => {
    try {
        const {
            globals,
            origins,
            entry,
        } = configuration;

        const serviceWorkerConfiguration = {
            globals,
            origins,
        };

        await navigator.serviceWorker.register('service-worker.js?' + JSON.stringify(serviceWorkerConfiguration));
        await navigator.serviceWorker.ready;

        const launch = async () => {
            await import(entry);
        };

        // this launches the app if the SW has been installed before or immediately after registration
        // https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle#clientsclaim
        if (navigator.serviceWorker.controller) {
            await launch();
        } else {
            navigator.serviceWorker.addEventListener('controllerchange', launch);
        }
    } catch (error) {
        console.error('Service worker registration failed', error.stack);
    }
}
// #endregion module



// #region exports
export default bootloader;
// #endregion exports
