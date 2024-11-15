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

        this.socket.on(
            'chat-message',
            async (ChatMessage: InputMessageInterface): Promise<void> => {
                // Client doesn't exist or sent a mismatched auth code.
                const User = this.absol.connectedUsers.get(this.socket.id);
                if (typeof User == 'undefined' || ChatMessage.User.Auth_Code !== User.Auth_Code) {
                    console.log(
                        '[Chat | Server] Client sent a mis-matched or invalid auth code or is already disconnected.'
                    );
                    return;
                }

                // Client is Chat or RPG banned.
                if (await IsUserBanned(User.User_ID)) {
                    console.log('[Chat | Server] User is banned.');

                    const ChatMessage = 'You are banned from chatting.';
                    const BotMessage = this.absol.messageManager.SendBotMessage(
                        ChatMessage,
                        true,
                        User.User_ID
                    );

                    this.socket.emit('chat-message', BotMessage);

                    this.socket.disconnect();

                    return;
                }

                // Client has sent too many messages in a short period of time.
                if (this.isSpamming(User)) {
                    console.log('[Chat | Server] User is spamming.');

                    const ChatMessage = 'You are sending messages to quickly.';
                    const BotMessage = this.absol.messageManager.SendBotMessage(
                        ChatMessage,
                        true,
                        User.User_ID
                    );

                    this.socket.emit('chat-message', BotMessage);

                    return;
                }

                // Client has sent a message over the character limit.
                if (ChatMessage.Message.Text.length > this.messageCharLimit) {
                    console.log('[Chat | Server] User sent a message over the character limit.');

                    const ChatMessage = `Please keep messages at or under ${this.messageCharLimit} characters.`;
                    const BotMessage = this.absol.messageManager.SendBotMessage(
                        ChatMessage,
                        true,
                        User.User_ID
                    );

                    this.socket.emit('chat-message', BotMessage);

                    return;
                }

                console.log(
                    '[Chat | Server | SocketChatMessage] Sending message to the client socket:',
                    ChatMessage
                );

                this.socket.emit('chat-message', ChatMessage);
                this.messageManager.AddMessage(ChatMessage);
            }
        );
    }

    /**
     * Check if the client is spamming.
     */
    private isSpamming(client: UserInterface): boolean {
        const SpamTimeLimit = Math.round(Date.now()) - this.spamCheckIntervalSec * 1_000;

        const RecentMessageCount = Array.from(this.absol.messageManager.messages.values()).filter(
            (message) =>
                message.Message.Timestamp! >= SpamTimeLimit &&
                message.User.User_ID === client.User_ID
        ).length;

        return RecentMessageCount >= this.spamCheckMessageCount;
    }
}
