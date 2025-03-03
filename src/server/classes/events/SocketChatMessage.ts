import { Socket } from 'socket.io';

import Absol from '../Absol';

import { MessageManager } from '../MessageManager';

import { IsUserBanned } from '../../util/IsUserBanned';

import { InputMessageInterface } from '../../types/MessageInterface';
import { UserInterface } from '../../types/UserInterface';

export class SocketChatMessage {
    private absol: Absol;
    private socket: Socket;

    //
    private messageManager: MessageManager;

    //
    private messageCharLimit: number = 256;
    private spamCheckMessageCount: number = 5;
    private spamCheckIntervalSec: number = 5;

    constructor(absol: Absol, socket: Socket, messageManager: MessageManager) {
        this.absol = absol;
        this.socket = socket;

        //
        this.messageManager = messageManager;
    }

    public Initialize(): void {
        console.log("[Chat | Server | SocketChatMessage] Watching for 'chat-message' events.");

        this.socket.on('chat-message', async (ChatMessage: InputMessageInterface): Promise<void> => {
            const User = this.absol.connectedUsers.get(this.socket.id);
            if (typeof User == 'undefined' || ChatMessage.User.Auth_Code !== User.Auth_Code) {
                console.log(
                    '[Chat | Server] Client sent a mis-matched or invalid auth code or is already disconnected.'
                );
                return;
            }

            /**
             * Client is Chat or RPG banned.
             */
            if (await IsUserBanned(User.User_ID)) {
                console.log('[Chat | Server] User is banned.');

                const ChatBotMessage = 'You are banned from chatting.';
                const BotMessage = this.absol.messageManager.SendBotMessage(ChatBotMessage, true, User.User_ID);

                this.socket.emit('chat-message', BotMessage);

                this.socket.disconnect();

                return;
            }

            /**
             * Client has sent too many messages in a short period of time.
             */
            if (this.isSpamming(User)) {
                console.log('[Chat | Server] User is spamming.');

                const ChatBotMessage = 'You are sending messages to quickly.';
                const BotMessage = this.absol.messageManager.SendBotMessage(ChatBotMessage, true, User.User_ID);

                this.socket.emit('chat-message', BotMessage);

                return;
            }

            /**
             * Client has sent a message over the character limit.
             */
            if (ChatMessage.Message.Text.length > this.messageCharLimit) {
                console.log('[Chat | Server] User sent a message over the character limit.');

                const ChatBotMessage = `Please keep messages at or under ${this.messageCharLimit} characters.`;
                const BotMessage = this.absol.messageManager.SendBotMessage(ChatBotMessage, true, User.User_ID);

                this.socket.emit('chat-message', BotMessage);

                return;
            }

            /**
             * Handle command messages.
             */
            if (ChatMessage.Message.Text.startsWith(this.absol.commandManager.commandPrefix)) {
                const commandResponse = await this.absol.commandManager.ProcessCommand(ChatMessage);

                // Handle clear command special case
                if (commandResponse && commandResponse.clearMessages) {
                    this.absol.messageManager.ClearMessages();

                    const notification = this.absol.messageManager.NotifyChatCleared(User);

                    this.absol.server?.emit('chat-cleared');
                    this.absol.server?.emit('chat-message', notification);

                    return;
                }

                // Handle regular command responses
                if (commandResponse) {
                    const BotMessage = this.absol.messageManager.SendBotMessage(
                        commandResponse.message,
                        true,
                        User.User_ID
                    );

                    this.socket.emit('chat-message', BotMessage);
                    return;
                }
            }

            /**
             * Validation checks have passed; sending message to the socket.
             */
            this.absol.server?.emit('chat-message', ChatMessage);
            this.messageManager.AddMessage(ChatMessage);

            console.log('[Chat | Server | SocketChatMessage] Sent message to the client socket:', ChatMessage);
        });
    }

    /**
     * Check if the client is spamming.
     */
    private isSpamming(client: UserInterface): boolean {
        const SpamTimeLimit = Math.round(Date.now()) - this.spamCheckIntervalSec * 1_000;

        const RecentMessageCount = Array.from(this.absol.messageManager.messages.values()).filter(
            (message) => message.Message.Timestamp! >= SpamTimeLimit && message.User.User_ID === client.User_ID
        ).length;

        return RecentMessageCount >= this.spamCheckMessageCount;
    }
}
