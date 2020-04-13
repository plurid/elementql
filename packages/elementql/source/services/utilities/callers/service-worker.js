const generateUtilities = () => {
    const uriComponent = (decodeURIComponent(self.location.search) || '?{}').slice(1);

    const {
        globals,
        origins,
    } = JSON.parse(uriComponent);

    const {
        elementql,
        application,
    } = origins;

    const format = str => str.split(/^ +/m).join('').trim();

    const matchUrl = (url, key) => url.includes(`/${key}/`);

    const getGlobalByUrl = (url) => Object.keys(globals).reduce((res, key) => {
        if (res) {
            return res;
        }
        if (matchUrl(url, key)) {
            return globals[key];
        }
        return res;
    }, null);


    const jsHeaders = new Headers({
        'Content-Type': 'application/javascript'
    });


    return {
        uriComponent,
        globals,
        origins,
        elementql,
        application,
        format,
        getGlobalByUrl,
        matchUrl,
        jsHeaders,
    };
}

const utilities = generateUtilities();



self.addEventListener('activate', event => event.waitUntil(clients.claim()));


self.addEventListener('fetch', (event) => {
    const {
        request: {
            url,
        },
    } = event;

    if (
        url.includes('/node_modules/')
    ) {
        const replace = url.replace(utilities.elementql, utilities.application);

        event.respondWith(
            fetch(
                replace,
                {
                    mode: 'no-cors',
                },
            ).then(
                response => response.text()
            ).then(body => {
                const script = utilities.format(`
                    const head = document.getElementsByTagName('head')[0];
                    const script = document.createElement('script');
                    script.setAttribute('type', 'text/javascript');
                    script.appendChild(document.createTextNode(${JSON.stringify(body)}));
                    head.appendChild(script);
                    export default window.${utilities.getGlobalByUrl(url)};
                `);

                return new Response(
                    script,
                    {
                        headers: utilities.jsHeaders,
                    },
                )
            })
        );
        return;
    }
});
