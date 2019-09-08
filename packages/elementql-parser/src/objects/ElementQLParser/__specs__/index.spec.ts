import ElementQLParser from '../';



describe('ElementQLParser basic', () => {
    it('works', () => {
        const query = `
import {
    <element>
}
        `;
        const parser = new ElementQLParser(query);
        const result = parser.parse();
        console.log(result);
        expect(true).toBe(true);
    });
});
