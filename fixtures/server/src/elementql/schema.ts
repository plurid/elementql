import elementql from '@plurid/elementql-tag';



const schema = elementql`
    element <element>

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


export default schema;
