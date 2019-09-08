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
        const elements: ElementQL[] = [];
        // return this.query;
        const importRE = new RegExp('^import.*{((.|\\n)*)}$', 'm');
        const importMatch = this.query.trim().match(importRE);
        // console.log(importMatch);

        if (importMatch) {
            const elementsString = importMatch[1];
            const elementsRE = new RegExp('<(.*)>', 'g');
            const elementsMatch = elementsString.trim().match(elementsRE);

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
