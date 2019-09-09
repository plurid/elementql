import ElementQLParser from '../';



describe('ElementQLParser basic', () => {
    it('gets a single element', () => {
        const query = `
import {
    <element>
}
        `;
        const elements = [ {name: 'element'} ];
        const parser = new ElementQLParser(query);
        const result = parser.parse();

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
});
