import elementql from '../';



describe('elementql', () => {
    it('works', () => {
        // const b = 'bbb';
        // const c = () => { console.log('ccc')};

        const element = elementql`
            import {
                <element>
            }
        `;
        // console.log(element);

        expect(element.length).toBe(1);
    });
});
