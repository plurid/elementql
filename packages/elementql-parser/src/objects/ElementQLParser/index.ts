import {
    IElementQLParser,
    ElementQL,
} from '../../interfaces';



class ElementQLParser implements IElementQLParser {
    private query: string;

    constructor(query: string) {
        this.query = query;
    }

    public parse(): ElementQL[] {
        let query = this.query
        query = query.replace(/\\n/g, ' ');
        query = query.replace(/\s+/g, ' ');
        query = query.trim();

        const elements: ElementQL[] = [];
        const importRE = new RegExp('^import.*{((.|\\n)*)}$', 'm');
        const importMatch = query.match(importRE);
        // console.log('importMatch', importMatch);

        if (importMatch) {
            const elementsString = importMatch[1];
            const elementsRE = new RegExp('<(.*)>', 'g');
            const elementsMatch = elementsString.trim().match(elementsRE);
            // console.log('elementsMatch', elementsMatch);

            if (elementsMatch) {
                for (let elementMatch of elementsMatch) {
                    const name = elementMatch.replace('<', '').replace('>', '');
                    const element: ElementQL = {
                        name,
                    };
                    elements.push(element);
                }
            }
        }

        return elements;
    }
}


export default ElementQLParser;
