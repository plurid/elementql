import React, {
    useEffect,
    useState,
} from 'react';
import './App.css';

import ElementQLClientReact from '@plurid/elementql-client-react';
import elementql from '@plurid/elementql-tag';



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
    ],
};


const App: React.FC = () => {
    const [Element, setElement] = useState<React.FC<any>>();

    useEffect(() => {
        const fetchElement = async () => {
            const elements = await elementQLClient.get(
                AnElementJSONRequest,
                'json',
            );
            console.log(elements);

            // const Element: React.FC<any> | undefined = await elementQLClient.get(ELEMENT);


            // console.log(Element);
            // if (Element) {
            //     setElement(Element);
            // }
        }

        fetchElement();
    });

    return (
        <div>
            ElementQL Client React

            {Element && (
                <Element />
            )}
        </div>
    );
}


export default App;
