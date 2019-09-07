import ElementQLClientReact from '../';



describe('ElementQLClientReact Client basic', () => {
    it('works', () => {
        const options = {
            url: '',
        }
        const elementQLClientReact = new ElementQLClientReact(options);
        expect(true).toBe(true);
    });
});
