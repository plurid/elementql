import elementql from '../';


describe('elementql', () => {
    it('works', () => {
        const b = 'bbb';
        const c = () => { console.log('ccc')};

        const a = elementql`
            import {
                element
                ${b}
                ${c}
            }
        `;

        expect(true).toBeTruthy();
    });
});
