import React from 'react';



export interface ElementWithPropertyProperties {
    property: string;
}

const ElementWithProperty = (
    properties: ElementWithPropertyProperties,
) => {
    /** properties */
    const {
        property,
    } = properties;


    /** render */
    return (
        <div>Element with property {property}</div>
    );
}


export default ElementWithProperty;
