# ElementQL Client React



## Usage

    import elementQLClientReact, {
        elementQL
    } from '@plurid/elementql-client-react';

    const elementQLClient = elementQLClientReact({
        url: 'https://api.example.com/elementql',
    });

    const DIV = elementQL`
        import {
            <Div>
        }
    `;

    // gets a React Function Component
    const Div = await elementQL.get(DIV);


@plurid/elementql-client-react uses @plurid/elementql-client under the hood to inject the script/style

and returns window.elementQL.Div which is a React function component
