// import React from"http://localhost:21100/elementql/library-global/react.js";
// import ReactDOM from"http://localhost:21100/elementql/library-global/react-dom.js";
// import AHeader from"http://localhost:21100/elementql/356539e54814c8225d337bdbb91799d4.js";
// import AFooter from"http://localhost:21100/elementql/67d119922aad4ccaea30d9e7b34ed150.js";
// var Page= (React) => () => {
//     return React.createElement("div",null,React.createElement(AHeader(React),null),React.createElement(AFooter(React),null))};
// //     return React.createElement("div",null, 'foo');
// // }
// export default Page;



import React from"./node_modules/react/umd/react.production.min.js";
import ReactDOM from"./node_modules/react-dom/umd/react-dom.production.min.js";

import AHeader from"http://localhost:21100/elementql/356539e54814c8225d337bdbb91799d4.js";
import AFooter from"http://localhost:21100/elementql/67d119922aad4ccaea30d9e7b34ed150.js";
var Page=  () => {
    return React.createElement("div",null,React.createElement(AHeader,null),React.createElement(AFooter,null))};
//     return React.createElement("div",null, 'foo');
// }
export default Page;
