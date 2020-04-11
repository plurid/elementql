// @ts-nocheck
import React from 'react';
import AHeader from './AHeader';
import AFooter from './AFooter';



var Page = function () {
    return (
        React.createElement(
            "div", null,
            React.createElement(AHeader, null),
            React.createElement(AFooter, null),
        ),
    );
};


export default Page;
