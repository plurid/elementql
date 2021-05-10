// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
    } from 'react';

    import ElementQLClient from '../objects/ElementQLClient';
    // #endregion libraries
// #endregion imports



// #region module
const useElementQL = <R = any>(
    client: ElementQLClient,
    request: R,
    type: 'json' | 'elementql',
): Record<string, React.FC<any>> | undefined => {
    // #region state
    const [
        Elements,
        setElements,
    ] = useState<Record<string, React.FC<any>> | undefined>();
    // #endregion state


    // #region effects
    useEffect(() => {
        let mounted = true;

        const fetchElements = async () => {
            const {
                status,
                Elements,
            }: any = await client.get(
                request,
                type,
            );

            if (!status || !mounted) {
                return;
            }

            setElements(Elements);
        }

        fetchElements();

        return () => {
            mounted = false;
        }
    }, []);
    // #endregion effects


    return Elements;
}
// #endregion module



// #region exports
export default useElementQL;
// #endregion exports
