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
     * Gets a React Element from the server if the elementLiteral contains only one element.
     * Returns an object of elements if the elementLiteral contains multiple elements.
     *
     * @param elementLiteral elementql-tag literal
     */
    public async get(elementLiteral: any) {
        // get element name/id from elementLiteral
        await this.client.get(elementLiteral);

        console.log(window.elementql)

        if (window.elementql) {
            console.log('Return Element based on Id/Name');
            if (window.elementql.element) {
                return window.elementql.element;
            }
        }

        return;
    }
}


export default ElementQLClientReact;
