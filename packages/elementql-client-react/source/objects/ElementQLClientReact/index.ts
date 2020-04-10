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

        console.log('elements', elements);

        // console.log(window.elementql)

        // if (window.elementql) {
        //     console.log('Return Element based on Id/Name');
        //     if (window.elementql.element) {
        //         return window.elementql.element;
        //     }
        // }

        return;
    }
}


export default ElementQLClientReact;
