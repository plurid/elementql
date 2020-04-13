const configuration = {
    globals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
    },
    origins: {
        elementql: 'http://localhost:21100/elementql',
        application: 'http://localhost:8002',
    },
};


const bootloader = async (
    configuration,
) => {
    try {
        await navigator.serviceWorker.register('service-worker.js?' + JSON.stringify(configuration));
        await navigator.serviceWorker.ready;

        const launch = async () => {
            await import('./app/index.js');
        };

        // this launches the React app if the SW has been installed before or immediately after registration
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


bootloader(configuration);
