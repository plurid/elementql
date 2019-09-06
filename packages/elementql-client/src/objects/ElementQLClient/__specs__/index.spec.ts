import ElementQLClient from '../';



describe('ElementQL Client basic', () => {
    it('works', () => {
        const options = {
            url: '',
        }
        const elementQLClient = new ElementQLClient(options);
        expect(true).toBe(true);
    });
});
