// #region imports
    // #region external
    import ElementQLClient from '../';
    // #endregion external
// #endregion imports



// #region module
describe('ElementQL Client basic', () => {
    it('works', () => {
        const options = {
            url: '',
        };
        const elementQLClient = new ElementQLClient(options);
        expect(true).toBe(true);
    });
});
// #endregion module
