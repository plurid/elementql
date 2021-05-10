// #region imports
    import ElementQLClientReact from '../';
// #endregion imports



// #region module
describe('ElementQLClientReact Client basic', () => {
    it('works', () => {
        const options = {
            url: '',
        }
        const elementQLClientReact = new ElementQLClientReact(options);
        expect(true).toBe(true);
    });
});
// #endregion module
