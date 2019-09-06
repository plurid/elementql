import ElementQLServer from '../';



describe('ElementQL Server basic', () => {
    it('works', () => {
        const options = {
            port: 3333,
            verbose: true,
        }
        const elementQLServer = new ElementQLServer(options);
        elementQLServer.start();
        elementQLServer.stop();
        expect(true).toBe(true);
    });
});
