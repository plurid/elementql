import ElementQLServer from '../';



describe('ElementQL Server basic', () => {
    it('works', () => {
        const options = {
            port: 3333,
            verbose: true,
            schema: '',
            resolvers: '',
        }
        const elementQLServer = new ElementQLServer(options);
        expect(true).toBe(true);
    });
});
