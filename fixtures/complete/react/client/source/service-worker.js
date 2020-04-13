// const elementQLServiceWorker = './node_modules/@plurid/elementql-client-react/distrubtion/service-worker.js';


// importScripts(elementQLServiceWorker);


const removeSpaces = str => str.split(/^ +/m).join('').trim();

const globalMap = {
    'react': 'React',
    'react-dom': 'ReactDOM'
};

const getGlobalByUrl = (url) => Object.keys(globalMap).reduce((res, key) => {
    if (res) return res;
    if (matchUrl(url, key)) return globalMap[key];
    return res;
}, null);

const matchUrl = (url, key) => url.includes(`/${key}/`);

const headers = new Headers({
    'Content-Type': 'application/javascript'
});


self.addEventListener('activate', event => event.waitUntil(clients.claim()));


self.addEventListener('fetch', (event) => {
    let { request: { url } } = event;

    console.log('url', url);

    if (
        url.includes('/node_modules/')
    ) {
        console.log('GLOBAL url', url);
        const replace = url.replace('21100/elementql/', '8000/');
        console.log('replace', replace);

        event.respondWith(
            fetch(replace)
                .then(response => response.text())
                .then(body => {
                    // console.log('body', body);

                    const script = removeSpaces(`
                        const head = document.getElementsByTagName('head')[0];
                        const script = document.createElement('script');
                        script.setAttribute('type', 'text/javascript');
                        script.appendChild(document.createTextNode(${JSON.stringify(body)}));
                        head.appendChild(script);
                        export default window.${getGlobalByUrl(url)};
                    `);

                    // console.log(script);

                    return new Response(script, {headers})
                })
        );
        return;
    }

    // event.respondWith(
    //     fetch(event.request)
    // );
});
