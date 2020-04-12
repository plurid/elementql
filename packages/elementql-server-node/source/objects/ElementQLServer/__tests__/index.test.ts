import ElementQLServer from '..';



describe('ElementQL Server:', () => {
    it('is instantiable.', async () => {
        const elementQLServer = new ElementQLServer({
            verbose: false,
        });
        elementQLServer.cleanup();

        expect(elementQLServer).toBeInstanceOf(ElementQLServer);
    });
});
