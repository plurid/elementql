# Flow

User writes a React application

## Surface

``` html
<!-- client/public/index.html -->
<html>
    <head>
        <title>React ElementQL App</title>
    </head>
    <body>
        <div id="roo"></div>
        <script src="index.js"></script>
    </body>
</html>
```


``` tsx
// client/source/index.tsx
import React, {
    useState,
    useEffect,
} from 'react';
import ReactDOM from 'react-dom';
import ElementQLClient from '@plurid/elementql-client-react';


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}

const elementQLClient = new ElementQLClient({
    url: 'http://localhost:21100/elementql',
});

const AppElementQLJSONRequest = {
    elements: [
        {
            name: 'AppElementQL',
        },
    ],
};

const App = () => {
    const [AppElement, setAppElement] = useState<any>();

    useEffect(() => {
        const fetchElement = async () => {
            const {
                AppElementQL,
            }: any = await elementQLClient.get(
                HelloElementQLJSONRequest,
                'json',
            );

            const ReactAppElementQL = React.createElement(
                AppElementQL,
                null,
            );
            setElement(ReactAppElementQL);
        }

        fetchElement();
    }, []);

    return (
        <>
            {AppElement && (
                <>
                    {AppElement}
                </>
            )}
        </>
    );
}

ReactDOM.render(
    <App>,
    document.getElementByID('root'),
);
```

The file `client/source/index.tsx` gets packed in the standard manner into `client/public/index.js`, which will be the script actually loaded by `client/public/index.html`.


``` js
// client/source/service-worker.js

const elementQLServiceWorker = './node_modules/@plurid/elementql-client-react/distrubtion/service-worker.js';

importScripts(elementQLServiceWorker);
```

The file `client/source/service-worker.js` gets copied into `client/public/service-worker.js`.



The `AppElementQL` element is defined on the server

``` tsx
// server/elements/AppElementQL/index.tsx
import React from 'react';

const App = () => {
    return (
        <div>App</div>
    )
}

export default App;
```

The server is a simple initialization

``` ts
import ElementQLServer from '@plurid/elementql-server';

const server = new ElementQLServer();
server.start();
```


### Depths

When the module `server/elements/AppElementQL/index.tsx` gets transpiled on the server, it becomes `server/.elementql/transpiles/<contents-hash>.js`

``` js
// server/.elementql/transpiles/<contents-hash>.js
import React from './node_modules/react/umd/react.production.min.js';

const App = () => {
    return (
        React.createElement(
            "div",
            null,
            "App",
        )
    )
}

export default App;
```

The client service worker will detect the request for `./node_modules/react/umd/react.production.min.js`, intercept it, and replace it with a call to the local `node_modules`.
