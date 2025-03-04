import { DefaultEventsMap } from 'socket.io';

import * as io from 'socket.io-client';

import { SocketEvents } from './classes/Socket';

import { UserInterface } from './types/User';

export class Absolute {
    public socket: io.Socket<DefaultEventsMap, DefaultEventsMap>;
    private port: number = 8080;

    private socketEvents: SocketEvents;

    public isActive: boolean = true;

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
        return this.socket.connected && this.user!.Connected;
    }

    /**
     * Handle the client's chat input box.
     */
    public HandleInputBox(): void {
        const chatInput = document.getElementById('chatMessage');

        if (this.user?.Connected) {
            chatInput?.style.setProperty('background', '');
            chatInput?.setAttribute('disabled', 'false');
        } else {
            chatInput?.style.setProperty('background', '#666');
            chatInput?.setAttribute('disabled', 'true');
        }
    }

    /**
     * Initialize the socket for the client.
     * Initializes specific socket event handlers.
     */
    public Initialize(): void {
        /**
         * Attempt to connect the user before setting up rest of the handlers.
         */
        this.socketEvents.HandleConnect();
        this.socketEvents.HandleDisconnect();
        this.socketEvents.HandleMessage();
        this.socketEvents.HandleChatCleared();

        /**
         * The socket is offline or the user wasn't able to connect; let the user know.
         */
        if (!this.isActive) {
            let isShiny = Math.floor(Math.random() * 256) + 1 == 1;

            document.getElementById('chatContent')!.innerHTML = `
                <table style="width: 100%; height: 100%;">
                  <tr>
                    <td style="width: 100%; height: 100%;" valign="middle">
                      <img src='https://${location.hostname}/images/Pokemon/Sprites/${
                isShiny ? 'Shiny' : 'Normal'
            }/359.png' />
                      <br />
                      <b style="color: #ff0000; font-size: 14px;">Absolute Chat is offline.</b>
                      <br /><br />
                      Absol is currently offline for one reason or another.
                    </td>
                  </tr>
                </table>
            `;
        }
    }
}
