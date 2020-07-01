import React, {
    useState,
    useEffect,
} from 'react';
import ReactDOM from 'react-dom';

import ElementQLClient, {
    useElementQL,
} from '@plurid/elementql-client-react';



// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('service-worker.js');
// }


const elementQLClient = new ElementQLClient({
    url: 'http://localhost:21100/elementql',
});

const ElementQLJSONRequest = {
    elements: [
        {
            name: 'AppElementQL',
        },
        {
            name: 'ElementWithProperty',
        },
    ],
};


const App = () => {
    /** hooks */
    const HookElements = useElementQL(
        elementQLClient,
        ElementQLJSONRequest,
        'json',
    );

    /** state */
    const [Elements, setElements] = useState<any>();


    /** effects */
    useEffect(() => {
        let mounted = true;

        const fetchElements = async () => {
            const {
                status,
                Elements,
            }: any = await elementQLClient.get(
                ElementQLJSONRequest,
                'json',
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


    /** render */
    return (
        <div>
            <div style={{textAlign: 'center', padding: '30px'}}>
                ElementQL Client React
            </div>

            {HookElements
            && Elements
            && (
                <div>
                    <div style={{margin:'5px', fontSize: '12px'}}>
                        render zone
                    </div>

                    <div
                        style={{padding: '20px', background: 'hsl(220, 10%, 26%)'}}
                    >
                        <h1>
                            from custom hook
                        </h1>

                        <HookElements.AppElementQL />

                        <HookElements.ElementWithProperty
                            property="one"
                        />
                    </div>

                    <div
                        style={{padding: '20px', background: 'hsl(220, 10%, 26%)'}}
                    >
                        <h1>
                            from fetch
                        </h1>

                        <Elements.AppElementQL />

                        <Elements.ElementWithProperty
                            property="one"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}


ReactDOM.render(
    <App />,
    document.getElementById('root'),
);
