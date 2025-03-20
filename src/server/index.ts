import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

import { ValidateEnvironment } from './util/ValidateEnvironment';

import DatabaseManager from './classes/DatabaseManager';
import Absol from './classes/Absol';

// Validate our environment variables.
// Exits the process if any required values are not found/set.
ValidateEnvironment();

const SERVER_PORT = 8080;

// Prep server instance and ssl certs.
let SERVER_INSTANCE: http.Server;
let SERVER_SSL: Object = {};
if (fs.existsSync('/etc/letsencrypt/live/www.absoluterpg.com/fullchain.pem')) {
    try {
        SERVER_SSL = {
            cert: fs.readFileSync('/etc/letsencrypt/live/www.absoluterpg.com/fullchain.pem'),
            key: fs.readFileSync('/etc/letsencrypt/live/www.absoluterpg.com/privkey.pem'),
        };
    } catch (error) {
        console.log('[Absolute Chat | Init] Production SSL certs not found.', error);

        process.exit();
    }

    SERVER_INSTANCE = https.createServer(SERVER_SSL).listen(SERVER_PORT);
} else {
    SERVER_INSTANCE = http.createServer().listen(SERVER_PORT);
}

let initType: string;
process.argv.forEach((arg, index) => {
    index === 2 ? (initType = arg) : '';
});

const MYSQL_INSTANCE: DatabaseManager = DatabaseManager.instance;
MYSQL_INSTANCE.connectDatabase().finally(() => {
    if (MYSQL_INSTANCE.isConnected()) {
        let AbsolServer: Absol = new Absol(SERVER_INSTANCE);
        AbsolServer.start();
    }
});
