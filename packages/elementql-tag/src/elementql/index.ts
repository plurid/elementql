const elementql = (literals: TemplateStringsArray, ...placeholders: any[]) => {
    console.log(literals);
    console.log(placeholders);
    placeholders[1]();
}


export default elementql;
