// to have the imports of utiltiies/libraries from the elementql endpoint
// import React from 'https://api.domain.com/elementql/node_modules/react';



const AnElementWithName = (
    properties,
) => {
    const {
        name,
    } = properties;

    return React.createElement('div', null, `Hello from ${name}`);
}


export default AnElementWithName;
