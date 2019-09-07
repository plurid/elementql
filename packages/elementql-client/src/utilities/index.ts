// https://stackoverflow.com/a/39008859
export const injectScript = (src: string) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.src = src;
        script.addEventListener('load', resolve);
        script.addEventListener('error', () => reject('Error Loading Script.'));
        script.addEventListener('abort', () => reject('Script Loading Aborted.'));
        document.head.appendChild(script);
    });
}


export const injectStyle = (href: string) => {
    return new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = href;
        link.addEventListener('load', resolve);
        link.addEventListener('error', () => reject('Error Loading Stylesheet.'));
        link.addEventListener('abort', () => reject('Stylesheet Loading Aborted.'));
        document.head.appendChild(link);
    });
}
