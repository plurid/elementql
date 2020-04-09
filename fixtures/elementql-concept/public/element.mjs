// node modules are actually in the folder
// from where the element is served over the network
import React from './node_modules/react';



const AnElement = () => {
    return React.createElement('div', null, `Hello from element`);
};


export default AnElement;
