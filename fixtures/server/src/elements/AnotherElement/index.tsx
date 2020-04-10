// @ts-nocheck

// assume import React from 'react';
import React, {
    useEffect,
} from 'react';



const AnotherElement = () => {
    useEffect(() => {
        console.log('another element');
    }, []);

    return (
        <div>
            Hello from AnotherElement
        </div>
    );
}


export default AnotherElement;
