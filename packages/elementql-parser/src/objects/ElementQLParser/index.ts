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
        console.log('this.query', this.query);
        let query = this.query.split('\n');
        query = query.map(el => el.trim());
        // console.log('query', query);
        query = query.filter(el => el !== '');
        // console.log(query);
        // check if export or import
        let exporting = /export/.test(query[0]);
        let importing = /import/.test(query[0]);
        query = query.slice(1, query.length - 1);

        console.log(exporting, importing);
        console.log(query);

        // from the query extract
        // the root elements (with their subelements)
        // the root spaces (with their subspaces and elements)


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
