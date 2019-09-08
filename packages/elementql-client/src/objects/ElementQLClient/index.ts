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
        console.log('elementLiteral', elementLiteral);

        const elementFiles = await fetch(this.url,
            {
                method: 'POST',
                body: JSON.stringify(elementLiteral[0]),
                headers:{
                    'Content-Type': 'application/elementql'
                }
            }).then(res => {
                console.log(res);
                return res.json();
            })
            .catch(error => console.error('Error:', error));

        console.log('elementFiles', elementFiles);

        for (let element of elementFiles) {
            if (element.js) {
                console.log('injected script');
                await injectScript(element.js);
            }
            if (element.css) {
                console.log('injected style');
                await injectStyle(element.css);
            }
        }

        return true;
    }
}


export default ElementQLClient;
