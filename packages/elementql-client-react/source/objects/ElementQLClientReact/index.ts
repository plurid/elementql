import ElementQLClient from '@plurid/elementql-client';

import {
    ElementQLClientReact as IElementQLClientReact,
    ElementQLClientReactOptions,
} from '../../interfaces';



class ElementQLClientReact implements IElementQLClientReact {
    private client: ElementQLClient;

    constructor(options: ElementQLClientReactOptions) {
        const clientOptions = {
            url: options.url,
        };

        this.client = new ElementQLClient(clientOptions);
    }

    /**
     * Gets a React Element from the server if the elementsRequest contains only one element.
     * Returns an object of elements if the elementsRequest contains multiple elements.
     *
     * @param elementsRequest
     */
    public async get(
        elementsRequest: any,
        type: 'elementql' | 'json' = 'elementql',
    ) {
        const elements = await this.client.get(
            elementsRequest,
            type,
        );

        for (const element of elements) {
            const {
                name,
                urls,
            } = element;

            const elementModule = document.createElement('script');
            elementModule.type = 'module';
            elementModule.text =
`
import ${name} from 'http://localhost:33300${urls[0]}';

window.elementql = window.elementql || {};
window.elementql.${name} = ${name};
`;

            document.body.appendChild(elementModule);
        }

        return;
    }
}


export default ElementQLClientReact;
