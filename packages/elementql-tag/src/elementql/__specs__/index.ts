import elementql from '../';



describe('elementql', () => {
    it('imports an <element>', () => {
        const element = elementql`
            import {
                <element>
            }
        `;

        expect(element.length).toBe(1);
    });

    it.only('exports an <element>', () => {
        const element = elementql`
            export {
                <element>
            }
        `;

        expect(element.length).toBe(1);
    });

    it('exports an <element> and a space', () => {
        const space = elementql`
            space page {
                <page-element>
            }
        `;

        const element = elementql`
            export {
                <element>

                ${space}
            }
        `;

        expect(element.length).toBe(2);
    });
});
