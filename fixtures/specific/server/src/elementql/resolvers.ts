const resolvers = {
    element: (args: any) => {
        // return any type of element here - custom elements, react, vue, angular, etc.
    },

    page: {
        Header: () => {
            return {
                self: 'Header', // or Header: 'Header',
                Logo: 'Logo',
                UserProfile: 'UserProfile'
            };
        },
        Toolbar: () => {
            return {
                self: 'Toolbar',
                ToolbarButton: 'ToolbarButton',
            };
        }
    }
}


export default resolvers;
