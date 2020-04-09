// node modules are actually in the folder
// from where the element is served over the network
import './node_modules/react/umd/react.production.min.js';



const AnElement = () => {
    return React.createElement('div', null, `Hello from element`);
};


export default AnElement;
