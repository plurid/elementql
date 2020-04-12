import ElementQLServer from '..';



describe('ElementQL Server:', () => {
    it('is instantiable.', () => {
        const elementQLServer = new ElementQLServer();
        expect(elementQLServer).toBeInstanceOf(ElementQLServer);
    });
});
