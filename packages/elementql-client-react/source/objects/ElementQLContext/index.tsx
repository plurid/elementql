// #region imports
    // #region libraries
    import React, {
        Component,
    } from 'react';
    // #endregion libraries


    // #region internal
    import ElementQLContext from './context';
    // #endregion internal
// #endregion imports



// #region module
export interface ElementQLProviderProperties {
    elements: Record<string, React.FC<any>>;
}

class ElementQLProvider extends Component<
    React.PropsWithChildren<ElementQLProviderProperties>
> {
    static displayName = 'ElementQLProvider';

    private properties: React.PropsWithChildren<ElementQLProviderProperties>;


    constructor(
        properties: React.PropsWithChildren<ElementQLProviderProperties>,
    ) {
        super(properties);
        this.properties = properties;
    }


    public render() {
        const {
            children,
            elements,
        } = this.properties;

        return (
            <ElementQLContext.Provider
                value={{
                    elements,
                    getElement: this.getElement,
                }}
            >
                {children}
            </ElementQLContext.Provider>
        );
    }


    private getElement(
        name: string,
    ) {
        const element = this.properties.elements[name];

        return element;
    }
}
// #endregion module



// #region exports
const ElementQL = {
    Provider: ElementQLProvider,
    Consumer: ElementQLContext.Consumer,
};

export default ElementQL;
// #endregion exports
