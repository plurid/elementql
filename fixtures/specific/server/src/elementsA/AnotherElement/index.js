// @ts-nocheck
// assume import React from 'react';
import React from 'react';
var AnotherElement = function () {
    React.useEffect(function () {
        console.log('another element');
    }, []);
    return (React.createElement("div", null, "Hello from AnotherElement"));
};
export default AnotherElement;
