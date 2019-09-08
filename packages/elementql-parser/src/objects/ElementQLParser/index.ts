import {
    IElementQLParser,
} from '../../interfaces';



class ElementQLParser implements IElementQLParser {
    private query: string;

    constructor(query: string) {
        this.query = query;
    }

    parse() {
        return this.query;
    }
}


export default ElementQLParser;
