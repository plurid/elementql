// @ts-nocheck

// assume import React from 'react';
import React from 'react';



const AnotherElement = () => {
    React.useEffect(() => {
        console.log('another element');
    }, []);

    return (
        <div>
            Hello from AnotherElement
        </div>
    );
}


export default AnotherElement;
