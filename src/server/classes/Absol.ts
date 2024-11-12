import * as http from 'http';
import { Server, Socket } from 'socket.io';

import User from './UserManager';
import { MessageHandler } from './MessageManager';
import { CommandManager } from './CommandManager';

import MessageInterface, { InputMessageInterface } from '../types/MessageInterface';

export default class Absol {
    private server: Server | undefined;

    private MessageHandler: MessageHandler;
    private commandManager!: CommandManager;

    private clientPool: User[] = [];
    private messagePool: MessageInterface[] = [];

    private messageCharLimit: number = 256;
    private spamCheckMessageCount: number = 5;
    private spamCheckIntervalSec: number = 5;

    public messageBuffer: MessageInterface[] = [];

    constructor() {
        this.MessageHandler = new MessageHandler();
    }

    /**
     * Starts the server and preps the socket and events.
     */
    public start(server: http.Server, initType: string): void {
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
         * Initialize the CommandManager and pass the server instance to it.
         */
        this.commandManager = new CommandManager();

        /**
         * Handle connections to the server.
         */
        this.server.on('connection', (socket: Socket): void => {
            let client: User;

            /**
             * Handle the initial authentication of the client.
             */
            socket.on('auth', async (authObject): Promise<void> => {
                console.log('Attempting to authorize:', authObject);
                client = new User(authObject.UserID, authObject?.Auth_Code);
                if (!(await client.init())) {
                    return;
                }
                console.log('New client connected:', client);

                this.clientPool.push(client);
                this.getMessageHistory(client, 30);
            });

            /**
             * Handle the disconnection of a client.
             */
            socket.on('disconnect', (): void => {
                if (typeof client !== 'undefined') {
                    this.clientPool = this.clientPool.filter(
                        (tClient) => tClient.userData?.ID !== client.userData?.ID
                    );
                }
            });

            /**
             * Handle the emitted chat-message.
             */
            socket.on('chat-message', async (chatData: InputMessageInterface): Promise<void> => {
                console.log('Processing new chat message:', chatData);

                /**
                 * Client sent a mis-matched or invalid auth code.
                 */
                if (!(await client.auth(chatData?.user?.Auth_Code))) {
                    return;
                }

                /**
                 * Client is currently chat and/or RPG banned.
                 */
                if (await client.getBan()) {
                    socket.emit(
                        'chat-message',
                        this.MessageHandler.SendBotMessage(
                            `You are banned, ${client.userData?.Username}.`,
                            true,
                            client.userData?.ID
                        )
                    );

                    socket.disconnect();
                    return;
                }

                /**
                 * Client has sent too many messages in a short period of time.
                 */
                if (this.isSpamming(client)) {
                    socket.emit(
                        'chat-message',
                        this.MessageHandler.SendBotMessage(
                            `Please send fewer messages, ${client.userData?.Username}.`,
                            true,
                            client.userData?.ID
                        )
                    );

                    return;
                }

                /**
                 * Client has sent a message over the character limit.
                 */
                if (chatData.text.length > this.messageCharLimit) {
                    socket.emit(
                        'chat-message',
                        this.MessageHandler.SendBotMessage(
                            `Messages must be ${this.messageCharLimit} characters or less, ${client.userData?.Username}.`,
                            true,
                            client.userData?.ID
                        )
                    );

                    return;
                }

                this.messageBuffer.push(this.MessageHandler.SendMessage(chatData.text, client));

                /**
                 * Pass the message to the command handler in case it is a command.
                 */
                const commandResult = await this.commandManager.ProcessCommand(chatData);
                if (typeof commandResult !== 'undefined') {
                    this.messageBuffer.push(
                        this.MessageHandler.SendBotMessage(commandResult, true, chatData.user.ID)
                    );
                }

                /**
                 * Emit all messages in the buffer to all clients.
                 */
                for (const Message of this.messageBuffer) {
                    socket.emit('chat-message', Message);
                    this.messagePool.push(Message);
                }
            });
        });

        /**
         * Emit a welcoming message when the server initially boots.
         */
        let initMessage: MessageInterface;
        switch (initType) {
            case 'debug':
                initMessage = this.MessageHandler.SendBotMessage(
                    'Absolute Chat has started in debug mode.'
                );
                break;

            case 'update':
                initMessage = this.MessageHandler.SendBotMessage('Absolute has been updated!');
                break;

            default:
                initMessage = this.MessageHandler.SendBotMessage('Absolute Chat is online.');
                break;
        }

        this.server.emit('chat-message', initMessage);
        this.messagePool.push(initMessage);

        /**
         * Register our bot's commands.
         */
        this.commandManager.LoadCommands();
    }

    /**
     * Get the message history.
     */
    private getMessageHistory(client: User, messageCount: number): void {
        if (typeof this.server === 'undefined') {
            return;
        }

        messageCount = messageCount > 100 ? 100 : messageCount;

        let messagesToUse: MessageInterface[] = [];
        if (this.messagePool.length > messageCount) {
            messagesToUse = this.messagePool.slice(-messageCount);
        } else {
            messagesToUse = this.messagePool;
        }

        for (const message of messagesToUse) {
            if (!message.isPrivate || message.isPrivateTo === client.userData?.ID) {
                this.server.emit('chat-message', message);
            }
        }
    }

    /**
     * Check if the client is spamming.
     */
    private isSpamming(client: User): boolean {
        const TIME_LIMIT = Math.round(Date.now()) - this.spamCheckIntervalSec * 1_000;

        const RECENT_MESSAGE_COUNT = this.messagePool.filter(
            (message) => message.sentOn >= TIME_LIMIT && message.userID === client.userData?.ID
        ).length;

        return RECENT_MESSAGE_COUNT >= this.spamCheckMessageCount;
    }
}
