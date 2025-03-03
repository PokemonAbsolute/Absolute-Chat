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

            console.log('[Chat | Client] A user has connected to the socket.');

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

            console.log('[Chat | Client] A user has disconnected from the socket.');

            this.absolute.isActive = false;
            this.absolute.user.Connected = false;
            this.absolute.HandleInputBox();

            this.messageHandler.AddMessage({
                User: {
                    User_ID: -1,
                    Username: 'Absol',
                    Rank: 'Bot',
                    Avatar: '../images/Avatars/Custom/3.png',
                },
                Message: {
                    ID: this.messageHandler.messages.size,
                    Text: 'You have been disconnected from the chat. Please refresh the page.',
                    Private: true,
                    Private_To: this.absolute.user.User_ID,
                    Timestamp: new Date().getTime(),
                },
            });
        });
    }

    /**
     * Handle messages received from the server socket.
     */
    public HandleMessage(): void {
        console.log("[Chat | Client] Watching for 'chat-message' events.");
        this.socket.on('chat-message', (data: MessageInterface) => {
            this.messageHandler.AddMessage(data);
        });
    }

    /**
     * Handle chat clearing events from the server.
     */
    public HandleChatCleared(): void {
        console.log("[Chat | Client] Watching for 'chat-cleared' events.");
        this.socket.on('chat-cleared', () => {
            // Clear client-side messages
            this.messageHandler.ClearMessages();
            this.messageHandler.DisplayMessages();
        });
    }
}
