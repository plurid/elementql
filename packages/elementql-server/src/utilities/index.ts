import portscanner from 'portscanner';



export const checkAvailablePort = (port: number): Promise<number> => {
    const LOCALHOST = '127.0.0.1';
    return new Promise((resolve, reject) => {
        portscanner.findAPortNotInUse(port, port + 1000, LOCALHOST, (error, availablePort) => {
            if (error) {
                reject();
            }

            resolve(availablePort);
        });
    });
}
