import { DefaultEventsMap } from 'socket.io';

import * as io from 'socket.io-client';

import { Absolute } from '../client';

import { MessageHandler } from './MessageHandler';

import { MessageInterface } from '../types/Message';

export class SocketEvents {
    private absolute: Absolute;
    private socket: io.Socket<DefaultEventsMap, DefaultEventsMap>;

    private messageHandler: MessageHandler;

    /**
     * Constructor
     */
    constructor(absolute: Absolute, socket: io.Socket<DefaultEventsMap, DefaultEventsMap>) {
        this.absolute = absolute;
        this.socket = socket;

        this.messageHandler = new MessageHandler(absolute);
    }

    /**
     * Handle client connections to the socket.
     */
    public HandleConnect(): void {
        this.socket.on('connect', () => {
            if (typeof this.absolute.user === 'undefined') {
                this.absolute.isActive = false;
                this.absolute.user!.Connected = false;

                console.log('[Chat | Client] User failed to connect.');

                return;
            }

            this.absolute.isActive = true;
            this.absolute.user.Connected = true;

            this.socket.emit('auth', {
                User_ID: this.absolute.user.User_ID,
                Auth_Code: this.absolute.user.Auth_Code,
                Connected: this.absolute.user.Connected,
            });

            // Render message history.
            this.messageHandler.DisplayMessages();
        });
    }

    /**
     * Handle client disconnects from the socket.
     */
    public HandleDisconnect(): void {
        this.socket.on('disconnect', () => {
            if (!this.absolute.user) {
                return;
            }

            this.absolute.isActive = false;
            this.absolute.user.Connected = false;
            this.absolute.HandleInputBox();

            document.getElementById('chatContent')!.innerHTML = `
                <table style="width: 100%; height: 100%;">
                  <tr>
                    <td style="width: 100%; height: 100%;" valign="middle">
                      <img src='https://${location.hostname}/images/Pokemon/Sprites/Normal/359.png' />
                      <br />
                      <b style="color: #ff0000; font-size: 14px;">Absolute Chat is offline.</b>
                      <br /><br />
                      Absol is currently offline for one reason or another.
                    </td>
                  </tr>
                </table>
            `;
        });
    }

    /**
     * Handle messages received from the server socket.
     */
    public HandleMessage(): void {
        this.socket.on('chat-message', (data: MessageInterface) => {
            this.messageHandler.AddMessage(data);
        });
    }

    /**
     * Handle chat clearing events from the server.
     */
    public HandleChatCleared(): void {
        this.socket.on('chat-cleared', () => {
            this.messageHandler.ClearMessages();
            this.messageHandler.DisplayMessages();
        });
    }
}
