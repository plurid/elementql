const resolvers = {
    element: () => {

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
