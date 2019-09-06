import {
    ElementQLClient as IElementQLClient,
    ElementQLClientOptions,
} from '../../interfaces';



class ElementQLServer implements IElementQLClient {
    private url: string;

    constructor(options: ElementQLClientOptions) {
        this.url = options.url;
    }

    public async get(elementLiteral: any) {
        return fetch(
            this.url,
            {
                method: 'POST',
                body: JSON.stringify(elementLiteral),
                headers:{
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
            .catch(error => console.error('Error:', error));
    }
}


export default ElementQLServer;
