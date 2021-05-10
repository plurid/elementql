// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries
// #endregion imports



// #region module
export interface IElementQLProviderContext {
    elements: Record<string, React.FC<any>>;
    getElement: (name: string) => React.FC<any> | undefined;
}

const ElementQLProviderContext = React.createContext<IElementQLProviderContext | undefined>(undefined);
// #endregion module



// #region exports
export default ElementQLProviderContext;
// #endregion exports
