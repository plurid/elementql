const removeSpaces = str => str.split(/^ +/m).join('').trim();


self.addEventListener('activate', event => event.waitUntil(clients.claim()));

self.addEventListener('fetch', (event) => {
    let { request: { url } } = event;

    if (url.includes('/library-global/') && url.endsWith('.js')) {
        console.log(url);

        event.respondWith(
            fetch(url)
                .then(response => response.text())
                .then(body => {
                    console.log('JS', url);
                    return body;
                })
                .then(body => new Response(removeSpaces(`
                        const head = document.getElementsByTagName('head')[0];
                        const script = document.createElement('script');
                        script.setAttribute('type', 'text/javascript');
                        script.appendChild(document.createTextNode(${JSON.stringify(body)}));
                        head.appendChild(script);
                        export default window.${getGlobalByUrl(url)};
                    `), {headers}
                ))
        )
    }
});
