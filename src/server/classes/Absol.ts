import * as http from 'http';
import { Server, Socket } from 'socket.io';

import { CommandManager } from './CommandManager';
import { MessageManager } from './MessageManager';
import { SocketEvents } from './SocketEvents';

import { MessageInterface } from '../types/MessageInterface';
import { UserInterface } from '../types/UserInterface';

export default class Absol {
    private server: Server | undefined;
    private socketEvents: SocketEvents | undefined;

    //
    public messageManager!: MessageManager;
    public commandManager!: CommandManager;

    //
    public connectedUsers: Map<string, UserInterface> = new Map();

    /**
     * Constructor
     */
    constructor(server: http.Server, initType: string) {
        /**
         * Create a new server instance.
         */
        this.server = new Server(server, {
            allowEIO3: true,
            connectTimeout: 30000,
            cors: {
                origin: [
                    'http://localhost',
                    'https://localhost',
                    'https://absoluterpg.com',
                    'https://www.absoluterpg.com',
                ],
                credentials: true,
            },
        });

        /**
         * Initialize the CommandManager and load chat commands.
         */
        this.commandManager = new CommandManager();
        this.commandManager.LoadCommands();

        this.messageManager = new MessageManager();

        /**
         * Emit a welcoming message when the server initially boots.
         */
        let initMessage: MessageInterface;
        switch (initType) {
            case 'debug':
                initMessage = this.messageManager.SendBotMessage(
                    'Absolute Chat has started in debug mode.'
                );
                break;

            case 'update':
                initMessage = this.messageManager.SendBotMessage('Absolute has been updated!');
                break;

            default:
                initMessage = this.messageManager.SendBotMessage('Absolute Chat is online.');
                break;
        }

        this.server.emit('chat-message', initMessage);
    }

    /**
     * Starts the server and preps the socket and events.
     */
    public start(): void {
        if (typeof this.server === 'undefined') {
            console.log('[Chat | Server] Failed to spin up new server.');
            return;
        }

        /**
         * Handle connections to the server.
         */
        this.server.on('connection', (socket: Socket): void => {
            this.socketEvents = new SocketEvents(this, socket, this.messageManager);

            /**
             * Handle the initial authentication of the client.
             */
            this.socketEvents.auth.Initialize();

            /**
             * Handle the disconnection of a client.
             */
            this.socketEvents.disconnect.Initialize();

            /**
             * Handle the emitted chat-message.
             */
            this.socketEvents.chatMessage.Initialize();
        });
    }
}
