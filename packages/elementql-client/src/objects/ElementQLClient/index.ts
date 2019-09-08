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
        console.log(elementLiteral);

        const elementFiles = await fetch(this.url,
            {
                method: 'POST',
                body: JSON.stringify(elementLiteral),
                headers:{
                    'Content-Type': 'application/elementql'
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
