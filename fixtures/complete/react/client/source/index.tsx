import React, {
    useState,
    useEffect,
} from 'react';
import ReactDOM from 'react-dom';
import ElementQLClient from '@plurid/elementql-client-react';



if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}


const elementQLClient = new ElementQLClient({
    url: 'http://localhost:21100/elementql',
});

const AppElementQLJSONRequest = {
    elements: [
        {
            name: 'AppElementQL',
        },
    ],
};


const App = () => {
    const [AppElement, setAppElement] = useState<any>();

    useEffect(() => {
        const fetchElement = async () => {
            const {
                status,
                Elements,
            }: any = await elementQLClient.get(
                AppElementQLJSONRequest,
                'json',
            );

            if (!status) {
                return;
            }

            console.log(Elements);

            const ReactAppElementQL = React.createElement(
                Elements.AppElementQL,
                null,
            );
            setAppElement(ReactAppElementQL);
        }

        fetchElement();
    }, []);

    return (
        <>
            {AppElement && (
                <>
                    {AppElement}
                </>
            )}
        </>
    );
}


ReactDOM.render(
    <App />,
    document.getElementById('root'),
);
