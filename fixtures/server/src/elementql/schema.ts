import elementql from '@plurid/elementql-tag';



const spacePage = elementql`
    space page {
        element <Header> {
            element <Logo>
            element <UserProfile>
        }

        element <Toolbar> {
            element <ToolbarButton>
        }
    }
`;


const schema = elementql`
    export {
        element <element>

        ${spacePage}
    }
`;


// const schema = elementql`
//     { export
//         element <element>

//         space page {
//             element <Header> {
//                 element <Logo>
//                 element <UserProfile>
//             }

//             element <Toolbar> {
//                 element <ToolbarButton>
//             }
//         }
//     }
// `;


export default schema;
