import React, {
    useEffect,
} from 'react';
import './App.css';

import ElementQLClientReact from '@plurid/elementql-client-react';
import elementql from '@plurid/elementql-tag';



const elementQLClient = new ElementQLClientReact({
    url: 'http://localhost:33300/elementql',
});

const ELEMENT = elementql`
    import {
        <element>
    }
`;


const App: React.FC = () => {
    useEffect(() => {
        const fetchElement = async () => {
            const Element = await elementQLClient.get(ELEMENT);

            console.log(Element);
        }

        fetchElement();
    });

    return (
        <div>
            ElementQL Client React
        </div>
    );
}


export default App;
