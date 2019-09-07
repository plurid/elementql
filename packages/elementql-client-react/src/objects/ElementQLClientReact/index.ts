import ElementQLClient from '@plurid/elementql-client';

import {
    ElementQLClientReact as IElementQLClientReact,
    ElementQLClientReactOptions,
} from '../../interfaces';



class ElementQLClientReact implements IElementQLClientReact {
    private client: any;

    constructor(options: ElementQLClientReactOptions) {
        const clientOptions = {
            url: options.url,
        };

        this.client = new ElementQLClient(clientOptions);
    }

    public async get(elementLiteral: any) {
        // get element name/id from elementLiteral
        await this.client.get(elementLiteral);

        if (window.elementQL) {
            console.log('Return Element based on Id/Name');

            return window.elementQL;
        }
    }
}


export default ElementQLClientReact;
