import {
    ElementQLClientReact as IElementQLClientReact,
    ElementQLClientReactOptions,
} from '../../interfaces';



class ElementQLClientReact implements IElementQLClientReact {
    private url: string;

    constructor(options: ElementQLClientReactOptions) {
        this.url = options.url;
    }

    public async get(elementLiteral: any) {
        // use @plurid/elementql-client
    }
}


export default ElementQLClient;
