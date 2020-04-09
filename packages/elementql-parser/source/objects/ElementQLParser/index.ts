import {
    IElementQLParser,
    ElementQL,
} from '../../interfaces';




/**
 * https://matthiashager.com/converting-snake-case-to-camel-case-object-keys-with-javascript
 *
 * @param str
 */
const toCamel = (str: string) => {
    return str.replace(/([-_]([a-z]|\d+))/ig, ($1) => {
        return $1.toUpperCase()
            .replace('-', '')
            .replace('_', '');
    });
};


const getElement = (query: string) => {
    const elementRE = new RegExp('<(.*)>');
    const elementMatch = query.match(elementRE);

    if (elementMatch) {
        return {
            name: elementMatch[1],
        };
    }

    return;
}

const getElementWithSubelements = (query: string, restOfQuery: string[]) => {
    const element = getElement(query);

    if (element) {
        return {
            self: element,
        };
    }

    return;
}

const getSpace = () => {

}

const getSubspace = () => {

}



class ElementQLParser implements IElementQLParser {
    private query: string;

    constructor(query: string) {
        this.query = query;
    }

    public parse(): ElementQL[] {









        // // console.log('this.query', this.query);

        // let query = this.query.split('\n');
        // query = query.map(el => el.trim());
        // query = query.filter(el => el !== '');
        // // console.log('query', query);

        // // check if export or import
        // let exporting = /export/.test(query[0]);
        // let importing = /import/.test(query[0]);
        // query = query.slice(1, query.length - 1);
        // // console.log(exporting, importing);
        // // console.log(query);

        // const elements: any = {};

        // for (let [index, queryString] of query.entries()) {
        //     console.log('index', index);
        //     console.log('queryString', queryString);

        //     if (/^el(ement)?\s/.test(queryString)) {
        //         console.log('aaaa', queryString);

        //         if (queryString[queryString.length - 1] !== '{') {
        //             console.log('element', queryString);
        //             const element = getElement(queryString);
        //             if (element) {
        //                  elements[toCamel(element.name)] = element;
        //             }
        //         }

        //         if (queryString[queryString.length - 1] === '{') {
        //             // look into the element for self, subelements and their subelements, recursively
        //             // console.log('element with subelements', queryString);
        //             const element = getElementWithSubelements(queryString, query.slice(index,));
        //             if (element) {
        //                 elements[toCamel(element.self.name)] = element;
        //             }
        //         }
        //     }

        //     if (/^sp(ace)?\s/.test(queryString)) {
        //         // look into space for elements with or without subelements, other spaces
        //         // console.log('space', queryString);
        //     }
        // }








        // OLD

        // console.log('elements', elements);


        // let query = this.query;
        // // query = query.replace(/\\n/g, ' ');
        // query = query.replace(/\s+/g, ' ');
        // query = query.trim();

        // const importRE = new RegExp('^import.*{((.|\\n)*)}$', 'm');
        // const importMatch = query.match(importRE);
        // // console.log('importMatch', importMatch);
        // if (importMatch) {
        //     const elements: ElementQL[] = [];

        //     const elementsString = importMatch[1];
        //     const elementsRE = new RegExp('<(.*)>', 'g');
        //     const elementsMatch = elementsString.trim().match(elementsRE);
        //     // console.log('elementsMatch', elementsMatch);

        //     if (elementsMatch) {
        //         for (let elementMatch of elementsMatch) {
        //             const name = elementMatch.replace('<', '').replace('>', '');
        //             const element: ElementQL = {
        //                 name,
        //             };
        //             elements.push(element);
        //         }
        //     }

        //     return elements;
        // }


        // const exportRE = new RegExp('^export\\s{\\s(.+)\\s}$', 'm');
        // const exportMatch = query.match(exportRE);
        // console.log('exportMatch', exportMatch);
        // console.log(query);
        // if (exportMatch) {
        //     const elements: ElementQL[] = [];
        //     const elementsString = exportMatch[1].trim();

        //     const spacesRE = new RegExp('space\\s\\w+\\s{\\s.*?\\s}', 'g');
        //     const spacesMatch = elementsString.match(spacesRE);
        //     console.log('spacesMatch', spacesMatch);

        //     // to parse the exportMatch[1] for spaces
        //     // store the spaces in a data structure
        //     // check for elements within the spaces which are leaves and which are trees
        //     // remove the extracted data from elementsString
        //     // search for root elements (elements outside spaces)

        //     const elementsRE = new RegExp('(element\\s<(\\w+-?(\\w+|\\d+?))*>)', 'g');
        //     const elementsMatch = elementsString.trim().match(elementsRE);
        //     console.log('elementsMatch', elementsMatch);

        //     if (elementsMatch) {
        //         for (let elementMatch of elementsMatch) {
        //             const name = elementMatch.replace('element <', '').replace('>', '');
        //             const element: ElementQL = {
        //                 name,
        //             };
        //             elements.push(element);
        //         }
        //     }

        //     console.log(elements);

        //     return elements;
        // }

        return [];
    }
}


export default ElementQLParser;
