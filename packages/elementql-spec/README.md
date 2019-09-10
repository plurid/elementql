# ElementQL Specification


## Usage

Client-Side Usage

    // imports the input element defined in the root space
    // this input element is simply named input
    // it may or may not be the same as an HTML Input Element
    elementql`
        import {
            <input>
        }
    `;

    // import the brand element defined in the page1 > footer space
    elementql`
        import {
            page1 {
                footer {
                    <brand>
                }
            }
        }
    `;


Client Side with React

    import React, {
        useState,
        useEffect,
    } from 'react';
    import ElementQLClient from '@plurid/elementql-client';
    import elementql from '@plurid/elementql-tag';

    const ELEMENTQL_API_URL = 'http://localhost:33300/elementql'

    const elementQLClient = new ElementQLClient({
        url: ELEMENTQL_API_URL,
    });

    const ELEMENT = elementql`
        import {
            <Element>
        }
    `;

    const App: React.FC = () => {
        const [Element, setElement] = useState(null);
        useEffect(() => {
            const fetchElement = async () => {
                const FetchedElement = await elementQLClient.get(ELEMENT);
                setElement(FetchedElement);
            }
            fetchElement();
        });

        return (
            <div>
                <Element />
            </div>
        );
    }

    export default App;



Server-Side Usage

    // files structure
    elementql/
        resolvers.ts
        schema.ts
    elements/
        input/
            index.ts
        page1/
            footer/
                brand/
                    index.ts
    index.ts


    // schema.ts
    import elementql from '@plurid/elementql-tag';

    const schema = elementql`
        export {
            element <input>

            space page1 {
                space footer {
                    element <brand>
                }
            }
        }
    `;


    // resolvers.ts
    import input from '../elements/input';
    import brand from '../elements/page1/footer/brand';

    const resolvers = {
        input: () => input,
        page1: {
            footer: {
                brand: () => brand;
            },
        },
    };


    // elements
    // input/index.ts - HTML Elements
    const input = document.createElement('div');
    input.textContent = 'the ElementQL input element is actually a div';

    export default input;


    // input/index.ts - React
    import React from 'react';
    import { withElementQL } from '@plurid/elementql-react';

    const Input: React.FC = () => {
        return (
            <div>
                the ElementQL input element is actually a div
            </div>
        );
    }

    export default withElementQL(Input);


    // server (index.ts)
    import ElementQLServer from '@plurid/elementql-server';
    import resolvers from './elementql/resolvers';
    import schema from './elementql/schema';

    const configuration = {
        resolvers,
        schema,
    };

    const server = new ElementQLServer(configuration);

    server.start();



## Workflow

The developer writes the elements, say, using React, and places them on the server.

The developer writes the schema of the elements and the server logic for resolving the element requests.

The developer writes the client side which asks for elements based on the user's needs (URL, state, and such).
