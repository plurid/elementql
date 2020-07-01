import {
    ElementQLClientOptions,
} from '../../interfaces';

import {
    injectScript,
    injectStyle,
} from '../../utilities';



class ElementQLClient {
    private url: string;

    constructor(
        options: ElementQLClientOptions,
    ) {
        this.url = options.url;
    }

    public async get(
        elementsRequest: any,
        type: 'elementql' | 'json' = 'elementql',
    ) {
        switch (type) {
            case 'elementql':
                return await this.getWithElementQL(elementsRequest);
            case 'json':
                return await this.getWithJSON(elementsRequest)
        }
    }

    private async getWithElementQL(
        request: any,
    ) {
        const elementFiles = await fetch(this.url,
            {
                method: 'POST',
                body: JSON.stringify(request[0]),
                headers:{
                    'Content-Type': 'application/elementql'
                }
            }).then(res => {
                return res.json();
            })
            .catch(error => console.error('Error:', error));

        for (const element of elementFiles) {
            if (element.js) {
                await injectScript(element.js);
            }
            if (element.css) {
                await injectStyle(element.css);
            }
        }

        if (window.elementql) {
            if (window.elementql.element) {
                return window.elementql.element;
            }
        }

        return {
        };
    }

    private async getWithJSON(
        request: any,
    ) {
        const elementsRequest = await fetch(
            this.url,
            {
                method: 'POST',
                body: JSON.stringify(request),
                credentials: 'omit',
                headers:{
                    'Content-Type': 'application/json',
                },
            },
        );
        const elementsData = await elementsRequest.json();

        return elementsData;
    }
}


export default ElementQLClient;
