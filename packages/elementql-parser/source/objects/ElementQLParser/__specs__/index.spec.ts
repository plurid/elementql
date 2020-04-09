import ElementQLParser from '../';



describe('ElementQLParser basic', () => {
    it.only('gets a single element', () => {
        const query = `
import {
    ElementOne
    ElementTwo
}
        `;
        const elements = [ {name: 'element'} ];
        const parser = new ElementQLParser(query);
        const result = parser.parse();
        console.log(result);

        expect(result).toStrictEqual(elements);
    });

    it('gets a single element', () => {
        const query = `
import {
    <element>
}
        `;
        const elements = [ {name: 'element'} ];
        const parser = new ElementQLParser(query);
        const result = parser.parse();
        console.log(result);

        expect(result).toStrictEqual(elements);
    });

    it('gets multiple elements', () => {
        const query = `
import {
    <element-1>
    <element-2>
    <element-3>
}
        `;
        const elements = [
            {name: 'element-1'},
            {name: 'element-2'},
            {name: 'element-3'},
        ];
        const parser = new ElementQLParser(query);
        const result = parser.parse();

        expect(result).toStrictEqual(elements);
    });

    it('gets element', () => {
        const query = '\n            import {\n                <element>\n            }\n';
        const elements = [
            {name: 'element'},
        ];
        const parser = new ElementQLParser(query);
        const result = parser.parse();

        expect(result).toStrictEqual(elements);
    });

    it('gets multiple elements', () => {
        const query = `
export {
    element <ElementFoo>
    element <Element-Foo>
    element <Element-Foo-Bar3>
    element <element-1>
    element <element-2>

    space page {
        element <element-page>
    }
}
        `;
        const elements = [ {name: 'element'} ];
        const parser = new ElementQLParser(query);
        const result = parser.parse();

        expect(result).toStrictEqual(elements);
    });

    it('gets multiple spaces', () => {
        const query = `
export {
    element <element-1>
    element <element-2>

    space page {
        element <element-page>
    }

    space subpage {
        element <element-subpage>
    }
}
        `;
        const elements = [ {name: 'element'} ];
        const parser = new ElementQLParser(query);
        const result = parser.parse();

        expect(result).toStrictEqual(elements);
    });

    it('gets multiple spaces and subspaces', () => {
        const query = `
export {
    element <element-1>
    element <element-2> {
        self
        element <element-2-1>
    }

    space page {
        element <element-page> {
            element <element-page-1>
        }

        space subspace {
            element <element-subspace>
        }
    }

    space subpage {
        element <element-subpage>
    }
}
        `;

        const expectedResult = {
            element1: 'element-1',
            element2: {
                self: 'element-2',
                element21: 'element-2-1',
            },
            page: {
                elementPage: {
                    elementPage1: 'element-page-1',
                },
                subspace: {
                    elementSubspace: 'element-subspace',
                },
            },
            subPage: {
                elementSubpage: 'element-subpage',
            },
        };

        const parser = new ElementQLParser(query);
        const result = parser.parse();

        expect(result).toStrictEqual(expectedResult);
    });
});
