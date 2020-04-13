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
        const {
            status,
            data,
        } = await this.client.get(
            elementsRequest,
            type,
        );

        if (!status) {
            const response = {
                status: false,
                Elements: null,
            };
            return response;
        }

        const {
            elements,
        } = data;

        for (const element of elements) {
            const {
                name,
                files,
            } = element;

            const safeName = name.replace('/', '');

            for (const file of files) {
                const {
                    type,
                    url,
                } = file;

                const safeURL = url.replace('/elementql', '');

                switch (type) {
                    case '.js':
                        {
                            const elementModule = document.createElement('script');
                            elementModule.type = 'module';
                            elementModule.text =
`
import ${safeName} from '${this.options.url}${safeURL}';

window.elementql = window.elementql || {};
window.elementql.${safeName} = ${safeName};
`;

                            document.body.appendChild(elementModule);
                        }
                }
            }
        }

        const Elements = await new Promise((resolve, _) => {
            setTimeout(() => {
                const Elements = window.elementql;
                resolve(Elements);
            }, 700);
        });

        const response = {
            status: true,
            Elements,
        };

        return response;
    }
}


export default ElementQLClientReact;
