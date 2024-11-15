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
            console.log('[Chat | Client] A user has disconnected from the socket.');

            // Update chat input box
            this.absolute.HandleInputBox();

            // Send message to chat - private to the disconnected user
            this.messageHandler.AddMessage({
                User: {
                    User_ID: -1,
                    Username: 'Absol',
                    Rank: 'Bot',
                    Avatar: '../images/Avatars/Custom/3.png',
                },
                Message: {
                    ID: this.messageHandler.messages.size,
                    Text: 'You have been disconnected from the chat.',
                    Private: true,
                    Private_To: this.absolute.user!.User_ID,
                },
            });

            // Send disconnection to the server socket.
            this.socket.emit('disconnect', {
                User_ID: this.absolute.user!.User_ID,
                Username: this.absolute.user!.Username,
                Rank: this.absolute.user!.Rank,
                Auth_Code: this.absolute.user!.Auth_Code,
                Avatar: this.absolute.user!.Avatar,
                Connected: this.absolute.user!.Connected,
            });

            // Set the client socket to inactive and remove the user.
            this.absolute.isActive = false;
            this.absolute.user = undefined;

            // Render message history.
            this.messageHandler.DisplayMessages();
        });
    }

    /**
     * Handle messages received from the server socket.
     */
    public HandleMessage(): void {
        console.log("[Chat | Client] Watching for 'chat-message' events.");
        this.socket.on('chat-message', (data: MessageInterface) => {
            console.log('[Chat | Client] Received a message from the server socket:', data);

            this.messageHandler.AddMessage(data);
        });
    }

    /**
     * Handle fetching message history from the server socket.
     */
    public GetServerHistory(): void {
        console.log("[Chat | Client] Watching for 'chat-history' events.");
        this.socket.on('chat-history', (data: Map<number, MessageInterface>) => {
            console.log('[Chat | Client] Received message history from the server socket:', data);
        });
    }
}
