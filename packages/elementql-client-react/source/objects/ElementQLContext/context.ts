// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries
// #endregion imports



// #region module
export interface IElementQLContext {
    elements: Record<string, React.FC<any>>;
    getElement: (name: string) => React.FC<any> | undefined;
}

const ElementQLContext = React.createContext<IElementQLContext | undefined>(undefined);
// #endregion module



// #region exports
export default ElementQLContext;
// #endregion exports
