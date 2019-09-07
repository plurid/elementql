import {
    ElementQLClient as IElementQLClient,
    ElementQLClientOptions,
} from '../../interfaces';

import {
    injectScript,
    injectStyle,
} from '../../utilities';



class ElementQLClient implements IElementQLClient {
    private url: string;

    constructor(options: ElementQLClientOptions) {
        this.url = options.url;
    }

    public async get(elementLiteral: any) {
        // fetch from the server the element
        // that is
        // POST the element request from elementLiteral
        // and get back the filename of the element script
        const elementFiles = await fetch(this.url,
            {
                method: 'POST',
                body: JSON.stringify(elementLiteral),
                headers:{
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
            .catch(error => console.error('Error:', error));

        if (elementFiles.js) {
            await injectScript(elementFiles.js);
        }
        if (elementFiles.css) {
            await injectStyle(elementFiles.css);
        }

        return true;
    }
}


export default ElementQLClient;
