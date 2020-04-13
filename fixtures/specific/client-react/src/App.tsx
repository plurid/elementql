import React, {
    useEffect,
    useState,
} from 'react';
import './App.css';

import ElementQLClientReact from '@plurid/elementql-client-react';
// import elementql from '@plurid/elementql-tag';



const elementQLClient = new ElementQLClientReact({
    url: 'http://localhost:21100/elementql',
});

// const ELEMENT = elementql`
//     import {
//         <element>
//     }
// `;
// const ELEMENT = 'AnElement';

const AnElementJSONRequest = {
    elements: [
        {
            name: 'ASimplePage',
        },
    ],
};


const App: React.FC = () => {
    const [Element, setElement] = useState<any>();

    useEffect(() => {
        const fetchElement = async () => {
            const {
                status,
                Elements,
            }: any = await elementQLClient.get(
                AnElementJSONRequest,
                'json',
            );

            if (!status) {
                return;
            }

            console.log(Elements.ASimplePage);
            const ReactASimplePage = React.createElement(
                Elements.ASimplePage,
            );
            setElement(ReactASimplePage);
        }

        fetchElement();
    }, []);

    return (
        <div>
            <div style={{textAlign: 'center', padding: '30px'}}>
                ElementQL Client React
            </div>

            {Element && (
                <div>
                    <div style={{margin:'5px', fontSize: '12px'}}>
                        render zone
                    </div>

                    <div
                        style={{padding: '20px', background: 'hsl(220, 10%, 26%)'}}
                    >
                        {Element}
                    </div>
                </div>
            )}
        </div>
    );
}


export default App;
