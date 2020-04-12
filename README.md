<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/elementql/master/about/identity/elementql-logo.png" height="250px">
    <br />
    <a target="_blank" href="https://github.com/plurid/elementql/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: MIT">
    </a>
</p>


<h1 align="center">
    ElementQL
</h1>


<h3 align="center">
    Query Web Elements
</h3>



ElementQL is a query language specification and implementation to query a server for Web Elements.


### Contents

+ [Description](#description)
    + [Current State](#current-state)
    + [ElementQL Proposal](#elementql-proposal)
+ [Usage](#usage)
    + [Server](#server)
        + [NodeJS](#nodejs)
        + [Go](#go)
        + [Python](#python)
    + [Client](#client)
        + [React](#react)
+ [Plugins](#plugins)
    + [Babel](#babel)
    + [TypeScript](#typescript)
    + [Minify](#minify)
+ [Packages](#packages)



## Description

### Current State

Consider the following Web Element which uses [React](https://reactjs.org/)

``` typescript
const HelloElementQL = () => {
    return React.createElement('div', null, 'Hello from ElementQL');
}
```

When embedded into a standard `React` rendering process, the `HelloElementQL` functional element will generate a `div` containing the text `Hello from ElementQL`.

The normal manner of sending the element to the browser is by packing it up into an `Application`, in a large `JavaScript` `index.js` file, which gets attached to a `index.html` with a `script` tag and then gets sent by the server to the client.


### ElementQL Proposal

The manner proposed by `ElementQL` is to let the client request only the required elements at runtime from a server and receive only the particular element-specific module.



## Usage

### Server

#### NodeJS

The [`NodeJS`](https://nodejs.org) server can be installed running the command

``` bash
npm install @plurid/elementql-server
```

or

``` bash
yarn add @plurid/elementql-server
```

The simplest `ElementQL` server requires only to be started, the elements will be served from the default `./elements` path

``` typescript
// server.js
import ElementQLServer, {
    ElementQLServerOptions,
} from '@plurid/elementql-server';


const server = new ElementQLServer(options);

server.start();
```

The server will then accept requests on the `/elementql` path for the elements in the `./elements` directory.

The `./elements` directory has a flat structure of folders with `.js` or `.css` files. For example

```
.
|- server.js
|- elements
|   |- HelloElementQL
|   |   |- index.js
|   |-
|-
```

The `ElementQLServer` Object receives an options object

``` typescript
import {
    ElementQLServerOptions,
} from '@plurid/elementql-server';


/** defaults */
const options: ElementQLServerOptions = {
    port: 21100,

    rootDirectory: process.cwd(),
    buildDirectory: 'build',                    /** relative to the root directory */
    nodeModulesDirectory: 'node_modules',       /** relative to the root directory */
    elementqlDirectory: '.elementql',           /** relative to the build directory */
    transpilesDirectory: 'transpiles',          /** relative to the elementql directory */

    elementsPaths: [                            /**/
        'elements',                             /** relative to the build directory */
    ],                                          /**/
    libraries: {},
    endpoint: '/elementql',
    allowOrigin: ['*'],
    allowHeaders: ['*'],
    plugins: [                                  /**/
        'minify',                               /** default for production; for development is `[]` */
    ],                                          /**/

    verbose: true,
    open: true,
    playground: false,
    playgroundEndpoint: '/playground',

    store: null,
    metadataFilename: 'metadata.json',
};
```


The requests can be made using the `POST` method with a `Content-Type` header of `application/json` or `application/elementql`. For example


```
curl http://localhost:33300/elementql \
    -H "Content-Type: application/json" \
    -v --data '{"elements":[{"name":"HelloElementQL"}]}'
```


#### Go

The `elementql-server` for `Go` is a `go 1.14` module.


#### Python




### Client

#### React

Considering the standard `React` application, using `ElementQL` involves

+ defining an `ElementQL`/`JSON` request,
+ instantiating an `ElementQLClient` with the `URL` for the `ElementQL` server endpoint,
+ and making the request with the `useEffect`, `useState` standard `React` hooks.


``` tsx
import React, {
    useEffect,
    useState,
} from 'react';

import ElementQLClientReact from '@plurid/elementql-client-react';


const elementQLClient = new ElementQLClientReact({
    url: 'http://localhost:33300/elementql',
});

const HelloElementQLJSONRequest = {
    elements: [
        {
            name: 'HelloElementQL',
        },
    ],
};


const App: React.FC = () => {
    const [HelloElement, setHelloElement] = useState<any>();

    useEffect(() => {
        const fetchElement = async () => {
            const {
                HelloElementQL,
            }: any = await elementQLClient.get(
                HelloElementQLJSONRequest,
                'json',
            );

            const ReactHelloElementQL = React.createElement(
                HelloElementQL,
                null,
            );
            setElement(ReactHelloElementQL);
        }

        fetchElement();
    }, []);

    return (
        <>
            {HelloElement && (
                <>
                    {HelloElement}
                </>
            )}
        </>
    );
}


export default App;
```



## Plugins


### Babel

Uses [Babel](https://github.com/babel/babel) to transpile `.js` and `.jsx` element files.


### TypeScript

Uses [TypeScript](https://github.com/microsoft/TypeScript) to transpile `.ts` and `.tsx` element files.


### Minify

Uses [Terser](https://github.com/terser/terser) to minify the element files.



## Packages

<a target="_blank" href="https://www.npmjs.com/package/@plurid/elementql">
    <img src="https://img.shields.io/npm/v/@plurid/elementql.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/elementql][elementql] • base

[elementql]: https://github.com/plurid/elementql/tree/master/packages/elementql



<a target="_blank" href="https://www.npmjs.com/package/@plurid/elementql-client">
    <img src="https://img.shields.io/npm/v/@plurid/elementql-client.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/elementql-client][elementql-client]

[elementql-client]: https://github.com/plurid/elementql/tree/master/packages/elementql-client



<a target="_blank" href="https://www.npmjs.com/package/@plurid/elementql-client-react">
    <img src="https://img.shields.io/npm/v/@plurid/elementql-client-react.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/elementql-client-react][elementql-client-react] • `react` client

[elementql-client-react]: https://github.com/plurid/elementql/tree/master/packages/elementql-client-react



<a target="_blank" href="https://www.npmjs.com/package/@plurid/elementql-express">
    <img src="https://img.shields.io/npm/v/@plurid/elementql-express.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/elementql-express][elementql-express] • `express` middleware

[elementql-express]: https://github.com/plurid/elementql/tree/master/packages/elementql-server-express



<a target="_blank" href="https://www.npmjs.com/package/@plurid/elementql-parser">
    <img src="https://img.shields.io/npm/v/@plurid/elementql-parser.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/elementql-parser][elementql-parser]

[elementql-parser]: https://github.com/plurid/elementql/tree/master/packages/elementql-parser



<a target="_blank" href="https://www.npmjs.com/package/@plurid/elementql-server">
    <img src="https://img.shields.io/npm/v/@plurid/elementql-server.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/elementql-server][elementql-server-node] • NodeJS server

[elementql-server-node]: https://github.com/plurid/elementql/tree/master/packages/elementql-server-node



<a target="_blank" href="">
    <img src="https://img.shields.io/badge/go-v0.0.0-blue?&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/elementql-server][elementql-server-go] • Go server

[elementql-server-go]: https://github.com/plurid/elementql/tree/master/packages/elementql-server-go



<a target="_blank" href="https://www.npmjs.com/package/@plurid/elementql-tag">
    <img src="https://img.shields.io/npm/v/@plurid/elementql-tag.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/elementql-tag][elementql-tag]

[elementql-tag]: https://github.com/plurid/elementql/tree/master/packages/elementql-tag



[@plurid/elementql-specification][elementql-specification] • specification

[elementql-specification]: https://github.com/plurid/elementql/tree/master/packages/elementql-specification



[@plurid/elementql-org][elementql-org] • documentation

[elementql-org]: https://github.com/plurid/elementql/tree/master/packages/elementql-org
