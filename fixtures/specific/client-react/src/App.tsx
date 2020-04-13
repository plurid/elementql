import React, {
    useEffect,
    useState,
} from 'react';
import './App.css';

import ElementQLClientReact from '@plurid/elementql-client-react';
// import elementql from '@plurid/elementql-tag';



const elementQLClient = new ElementQLClientReact({
    url: 'http://localhost:33300/elementql',
});

// const ELEMENT = elementql`
//     import {
//         <element>
//     }
// `;
const ELEMENT = 'AnElement';

const AnElementJSONRequest = {
    elements: [
        {
            name: 'AnElement',
        },
        {
            name: 'AnElementWithName',
        }
    ],
};


const App: React.FC = () => {
    const [Element, setElement] = useState<any>();

    useEffect(() => {
        const fetchElement = async () => {
            const {
                // AnElement,
                AnElementWithName,
            }: any = await elementQLClient.get(
                AnElementJSONRequest,
                'json',
            );

            const ReactAnElementWithName = React.createElement(
                AnElementWithName,
                {
                    name: 'AnElementWithName from properties',
                },
            );
            setElement(ReactAnElementWithName);
        }

        fetchElement();
    }, []);

    return (
        <div>
            ElementQL Client React

            {Element && (
                <>
                    {Element}
                </>
            )}
        </div>
    );
}


export default App;
