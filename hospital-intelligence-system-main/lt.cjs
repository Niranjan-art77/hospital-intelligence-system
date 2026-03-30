const localtunnel = require('localtunnel');

(async () => {
    try {
        const tunnel = await localtunnel({ port: 3000 });
        console.log('LT_URL:' + tunnel.url);

        tunnel.on('close', () => {
            console.log('Tunnel closed.');
        });
    } catch (e) {
        console.error("Tunnel error", e);
    }
})();
