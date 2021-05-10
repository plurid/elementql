// #region imports
    // #region libraries
    import ElementQLClient from '@plurid/elementql-client';
    // #endregion libraries


    // #region external
    import {
        ElementQLClientOptions,
        InternalElementQLClientOptions,
        ElementQLGetOptions,
    } from '../../data/interfaces';

    import {
        DEFAULT_LOAD_TIMEOUT,
        DEFAULT_LOAD_RETRIES,
        DEFAULT_RECORD_OBJECT,
    } from '../../data/constants';
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
            loadTimeout: options.loadTimeout ?? DEFAULT_LOAD_TIMEOUT,
            loadRetries: options.loadRetries ?? DEFAULT_LOAD_RETRIES,
            recordObject: options.recordObject || DEFAULT_RECORD_OBJECT,
        };
    }

    /**
     * Gets React Elements from the server.
     *
     * @param elementsRequest
     * @param type
     */
    public async get(
        elementsRequest: any,
        type: 'elementql' | 'json' = 'elementql',
        options?: ElementQLGetOptions,
    ) {
        const recordObject = options?.recordObject || this.options.recordObject;
        const loadTimeout = options?.loadTimeout ?? this.options.loadTimeout;
        const loadRetries = options?.loadRetries ?? this.options.loadRetries;

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

window.${recordObject} = window.${recordObject} || {};
window.${recordObject}.${safeName} = ${safeName};
`;

                            document.body.appendChild(elementModule);
                        }
                }
            }
        }

        let WindowElements: any | undefined;
        let loadTries = 0;
        let requestedElementsLoaded = false;

        const loadElements = async () => {
            const WindowElements = await new Promise((resolve, _) => {
                setTimeout(() => {
                    const WindowElements = (window as any)[recordObject];
                                              // |
                                              // |- account for `recordObject` not being `elementql`

                    resolve(WindowElements);
                }, loadTimeout);
            });

            return WindowElements;
        }

        while (
            !WindowElements
            && !requestedElementsLoaded
            && loadTries < loadRetries
        ) {
            loadTries += 1;

            WindowElements = await loadElements();

            if (WindowElements) {
                let elementsCheckedAndLoaded = true;

                for (const element of elements) {
                    const {
                        name,
                    } = element;
                    if (!WindowElements[name]) {
                        elementsCheckedAndLoaded = false;
                    }
                }

                if (elementsCheckedAndLoaded) {
                    requestedElementsLoaded = true;
                }
            }

            if (
                requestedElementsLoaded
            ) {
                break;
            }
        }

        if (!WindowElements) {
            return {
                status: false,
            };
        }

        const RequestedElements: Record<string, React.FC<any>> = {};
        for (const element of elements) {
            const {
                name,
            } = element;
            RequestedElements[name] = WindowElements[name];
        }

        const response = {
            status: true,
            Elements: RequestedElements,
        };

        return response;
    }
}
// #endregion module



// #region exports
export default ElementQLClientReact;
// #endregion exports
