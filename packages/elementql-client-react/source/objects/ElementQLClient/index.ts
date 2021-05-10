// #region imports
    // #region libraries
    import ElementQLClient from '@plurid/elementql-client';
    // #endregion libraries


    // #region external
    import {
        ElementQLClientOptions,
        InternalElementQLClientOptions,
    } from '../../interfaces';
    // #endregion external
// #endregion imports



// #region module
class ElementQLClientReact {
    private client: ElementQLClient;
    private options: InternalElementQLClientOptions;

    constructor(
        options: ElementQLClientOptions,
    ) {
        const clientOptions = {
            url: options.url,
        };

        this.client = new ElementQLClient(clientOptions);
        this.options = {
            url: options.url,
            loadTimeout: options.loadTimeout ?? 700,
        };
    }

    /**
     * Gets a React Element from the server if the elementsRequest contains only one element.
     * Returns an object of elements if the elementsRequest contains multiple elements.
     *
     * @param elementsRequest
     * @param type
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
            }, this.options.loadTimeout);
        });

        const response = {
            status: true,
            Elements,
        };

        return response;
    }
}
// #endregion module



// #region exports
export default ElementQLClientReact;
// #endregion exports
