// @ts-nocheck
// import React from 'react';
import AHeader from './AHeader/index.js';
import AFooter from './AFooter/index.js';



var Page = function () {
    return (
        React.createElement(
            "div", null,
            React.createElement(AHeader, null),
            React.createElement(AFooter, null),
        )
    );
};


export default Page;
