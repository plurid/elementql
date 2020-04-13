import React, {
    useState,
    useEffect,
} from 'react';
import ReactDOM from 'react-dom';
import ElementQLClient from '@plurid/elementql-client-react';



// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('service-worker.js');
// }


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
            console.log(status);

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
        <div>
            <div style={{textAlign: 'center', padding: '30px'}}>
                ElementQL Client React
            </div>

            {AppElement && (
                <div>
                    <div style={{margin:'5px', fontSize: '12px'}}>
                        render zone
                    </div>

                    <div
                        style={{padding: '20px', background: 'hsl(220, 10%, 26%)'}}
                    >
                        {AppElement}
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
