import { DefaultEventsMap } from 'socket.io';

import * as io from 'socket.io-client';

import { SocketEvents } from './classes/Socket';

import { UserInterface } from './types/User';

export class Absolute {
    private socket: io.Socket<DefaultEventsMap, DefaultEventsMap>;
    private port: number = 8080;

    private socketEvents: SocketEvents;

    public isActive: boolean = false;

    public user: UserInterface | undefined;
    public messages: any;

    constructor(User: UserInterface) {
        this.socket = io.connect(`http://localhost:${this.port}`, {
            withCredentials: true,
            reconnectionDelay: 2000,
            reconnectionAttempts: 15,
            reconnection: true,
            secure: true,
        });

        this.socketEvents = new SocketEvents(this, this.socket);

        this.user = User;
    }

    /**
     * Check if the socket is connected.
     */
    public isConnected(): boolean {
        return this.socket.connected;
    }

    /**
     * Handle the client's chat input box.
     */
    public HandleInputBox(): void {
        const chatInput = document.getElementById('chatMessage');

        if (this.user?.Connected) {
            chatInput?.style.setProperty('background', '#666');
            chatInput?.setAttribute('disabled', 'true');
        } else {
            chatInput?.style.setProperty('background', '');
            chatInput?.setAttribute('disabled', 'false');
        }
    }

    /**
     * Initialize the socket for the client.
     * Initializes specific socket event handlers.
     */
    public Initialize(): void {
        this.socketEvents.HandleConnect();
        this.socketEvents.HandleDisconnect();
        this.socketEvents.HandleMessage();
    }
}
