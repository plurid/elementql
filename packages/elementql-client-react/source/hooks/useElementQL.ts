import React, {
    useState,
    useEffect,
} from 'react';

import ElementQLClient from '@plurid/elementql-client-react';



const useElementQL = (
    client: ElementQLClient,
    request: any,
    type: 'json' | 'elementql',
): undefined | Record<string, React.FC<any>> => {
    /** state */
    const [Elements, setElements] = useState<any>();


    /** effects */
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


    /** return */
    return Elements;
}


export default useElementQL;
