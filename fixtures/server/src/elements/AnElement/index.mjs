const AnElement = () => {
    React.useEffect(() => {
        console.log('Another Element');
    }, []);

    return React.createElement('div', null, `Hello from AnElement`);
};


export default AnElement;
