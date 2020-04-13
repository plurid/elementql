import ElementQLClient from '@plurid/elementql-client';

import {
    ElementQLClientReactOptions,
    InternalElementQLClientReactOptions,
} from '../../interfaces';



class ElementQLClientReact {
    private client: ElementQLClient;
    private options: InternalElementQLClientReactOptions;

    constructor(
        options: ElementQLClientReactOptions,
    ) {
        const clientOptions = {
            url: options.url,
        };

        this.client = new ElementQLClient(clientOptions);
        this.options = options;
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
        const data = await this.client.get(
            elementsRequest,
            type,
        );

        const {
            elements,
        } = data;

        for (const element of elements) {
            const {
                name,
                files,
            } = element;

            console.log(element);

//             const elementModule = document.createElement('script');
//             elementModule.type = 'module';
//             elementModule.text =
// `
// import ${name} from '${this.options.url}${urls[0]}';

// window.elementql = window.elementql || {};
// window.elementql.${name} = ${name};
// `;

//             document.body.appendChild(elementModule);
        }

        const Elements = await new Promise((resolve, _) => {
            setTimeout(() => {
                const Elements = window.elementql;
                resolve(Elements);
            }, 700);
        });

        console.log(Elements);

        return Elements;
    }
}


export default ElementQLClientReact;
