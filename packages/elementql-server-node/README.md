<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/elementql/master/about/identity/elementql-logo.png" height="250px">
    <br />
    <br />
    <a target="_blank" href="https://github.com/plurid/elementql/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-DEL-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: DEL">
    </a>
</p>



<h1 align="center">
    ElementQL
</h1>


<h3 align="center">
    Query Web Elements
</h3>



<br />


`ElementQL` is a query language specification and implementation to query a server for Web Elements source code in order to render them on the client.


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
+ [Codeophon](#codeophon)



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

##### Install

The [`NodeJS`](https://nodejs.org) server can be installed running the command

``` bash
npm install @plurid/elementql-server
```

or

``` bash
yarn add @plurid/elementql-server
```

##### Start

The simplest `ElementQL` server requires only to be started, the elements will be served from the default `./elements` path

``` typescript
// server.js
import ElementQLServer from '@plurid/elementql-server';


const server = new ElementQLServer();

server.start();
```

The server will then accept requests on the `http://localhost:21100/elementql` URL for the elements in the `./elements` directory.

##### Elements

The `./elements` directory has a structure of folders with element-specific files: `.js`, `.jsx`, `.ts`, `.tsx`, or `.css`. For example

```
.
|- server.js
|- elements
|   |- HelloElementQL
|   |   |- index.js
|   |-
|-
```

##### Options

The `ElementQLServer` Object can receive an options object

``` typescript
import {
    ElementQLServerOptions,
} from '@plurid/elementql-server';


/** defaults */
const options: ElementQLServerOptions = {
    protocol: 'https',                          /** default for production; for development: `'http'` */
    domain: '',                                 /** the domain for the server, e.g. example.com */
                                                /** will be used to resolve elements relative and library imports */
    port: 21100,

    rootDirectory: process.cwd(),
    buildDirectory: 'build',                    /** relative to the root directory */
    nodeModulesDirectory: 'node_modules',       /** relative to the root directory */
    elementqlDirectory: '.elementql',           /** relative to the build directory */
    transpilesDirectory: 'transpiles',          /** relative to the elementql directory */

    elementsDirectories: [                      /**/
        'elements',                             /** relative to the build directory */
    ],                                          /**/
    libraries: {},
    endpoint: '/elementql',
    allowOrigin: ['*'],
    allowHeaders: ['*'],
    plugins: [                                  /**/
        'minify',                               /** default for production; for development: `[]` */
    ],                                          /**/

    verbose: true,
    open: true,
    playground: false,
    playgroundEndpoint: '/playground',

    store: null,
    metadataFilename: 'metadata.json',
};
```

##### Requests

In production, an [ElementQL Client](#client) is recommended. In development/testing, the requests for elements can be made using the `POST` method with a `Content-Type` header of `application/json` or `application/elementql`. For example

JSON

``` bash
curl http://localhost:21100/elementql \
    -H "Content-Type: application/json" \
    -v --data '{"elements":[{"name":"HelloElementQL"}]}'
```

ElementQL

``` bash
curl http://localhost:21100/elementql \
    -H "Content-Type: application/elementql" \
    -v --data 'elements{HelloElementQL}'
```

##### Metadata

In each element directory there can be an `elementql.yaml` file with metadata specific to the element

``` yaml
# the element name derived from the directory name will be overwrriten with `OverwriteName`
name: OverwriteName
```



#### Go

The `elementql-server` for `Go` is a `go 1.14` module.


#### Python




### Client

#### React

Considering the standard `React` application, using `ElementQL` involves

+ creating an `elementql.yaml` configuration file,

``` yaml
---
globals:
  react: React
  react-dom: ReactDOM
origins:
  elementql: http://localhost:21100/elementql
  application: http://localhost:8005
bootloader: './source/index.js'
entry: './app/index.js'
```


+ creating the `service-worker`,

``` js
const elementQLServiceWorker = './node_modules/@plurid/elementql/distribution/service-worker.js';


importScripts(elementQLServiceWorker);
```


+ creating and running the `metabootloader`,

``` js
const metabootloader = require('@plurid/elementql/distribution/metabootloader').default;


metabootloader();
```


+ creating and running `useLibraries`

``` js
const {
    libraries,
    useLibraries,
} = require('@plurid/elementql');



const usedLibraries = {
    react: libraries.react,
    reactDom: libraries.reactDom,
};

const buildDirectory = 'build';


useLibraries({
    libraries: usedLibraries,
    buildDirectory,
});
```


+ defining an `ElementQL`/`JSON` request,
+ instantiating an `ElementQLClient` with the `URL` for the `ElementQL` server endpoint,
+ and making the request with the `useEffect`, `useState` standard `React` hooks,
+ or with the `useElementQL` custom hook.


``` tsx
import React, {
    useEffect,
    useState,
} from 'react';

import ElementQLClientReact, {
    useElementQL,
} from '@plurid/elementql-client-react';



const elementQLClient = new ElementQLClientReact({
    url: 'http://localhost:21100/elementql',
});

const ElementQLJSONRequest = {
    elements: [
        {
            name: 'HelloElementQL',
        },
    ],
};


const AppWithHook: React.FC<any> = () => {
     const Elements = useElementQL(
        elementQLClient,
        ElementQLJSONRequest,
        'json',
    );

    return (
        <>
            {Elements && (
                <Elements.HelloElementQL />
            )}
        </>
    );
}


const App: React.FC<any> = () => {
    const [Elements, setElements] = useState<any>();

    useEffect(() => {
        let mounted = true;

        const fetchElements = async () => {
            const {
                status,
                Elements,
            }: any = await elementQLClient.get(
                ElementQLJSONRequest,
                'json',
            );

            if (!status || !mounted) {
                return;
            }

            setElements(Elements);
        }

        fetchElements();

        return () => {
            mounted = false;
        }
    }, []);

    return (
        <>
            {Elements && (
                <Elements.HelloElementQL />
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



[@plurid/elementql-specification][elementql-specification] • specification

[elementql-specification]: https://github.com/plurid/elementql/tree/master/packages/elementql-specification



[@plurid/elementql-org][elementql-org] • documentation

[elementql-org]: https://github.com/plurid/elementql/tree/master/packages/elementql-org



## [Codeophon](https://github.com/ly3xqhl8g9/codeophon)

+ licensing: [delicense](https://github.com/ly3xqhl8g9/delicense)
+ versioning: [αver](https://github.com/ly3xqhl8g9/alpha-versioning)



---



# ElementQL Server



the server reads the element files (script, style, templates) defined and serves on request


define elements schemas

define elements resolvers

get the files of the elements

get a request for an element (or elements)

compile the element(s) to client-specific browser
    -- no more duplicated code served to client

serve element(s)
