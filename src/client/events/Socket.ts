import { DefaultEventsMap } from 'socket.io';

import * as io from 'socket.io-client';

import { Absolute } from '../client';

export class SocketEvents {
    private absolute: Absolute;
    private socket: io.Socket<DefaultEventsMap, DefaultEventsMap>;

    /**
     * Constructor
     */
    constructor(absolute: Absolute, socket: io.Socket<DefaultEventsMap, DefaultEventsMap>) {
        this.absolute = absolute;
        this.socket = socket;
    }

    /**
     * Handle client connections to the socket.
     */
    public HandleConnect(): void {
        this.socket.on('connect', () => {
            this.absolute.isActive = true;
            this.absolute.user!.Connected = true;

            console.log('[Chat | Client] A user has connected to the socket.');

            // Emit the connection to the server.
            // this.socket.emit('auth', {
            //     UserID: this.absolute.user!.User_ID,
            //     Auth_Code: this.absolute.user!.Auth_Code,
            //     Connected: this.absolute.user!.Connected,
            // });
        });
    }

    /**
     * Handle client disconnects from the socket.
     */
    public HandleDisconnect(): void {
        this.socket.on('disconnect', function () {
            console.log('[Chat | Client] A user has disconnected from the socket.');
        });
    }

    /**
     * Handle client messages from the socket.
     */
    public HandleMessage(): void {
        this.socket.on('chat-message', function (data) {
            console.log('[Chat | Client] Received a message from the client:', data);
        });
    }
}
