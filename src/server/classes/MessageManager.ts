import User from './UserManager';
import { MessageHandler } from './MessageHandler';

import { MessageInterface } from '../types/MessageInterface';
import { UserInterface } from '../types/UserInterface';

export class MessageManager {
    private messageHandler: MessageHandler;

    //
    public messages: Map<number, MessageInterface> = new Map();

    //
    private messagesToShow: number = 30;

    /**
     * Constructor
     */
    constructor() {
        this.messageHandler = new MessageHandler();
    }

    /**
     * Add a message to the message history.
     */
    public AddMessage(Message: MessageInterface): void {
        this.messages.set(this.messages.size, Message);
    }

    /**
     * Clear the message history.
     */
    public ClearMessages(): void {
        console.log('[Chat | Server | MessageManager] Clearing message history.');
        this.messages.clear();
    }

    /**
     * Fetches all applicable messages in the message history to send to the client.
     * Should include private messages only if they were designated for the connected client.
     */
    public FetchMessages(User: UserInterface): Map<number, MessageInterface> {
        if (typeof User == 'undefined') {
            console.log('[Chat | Server | MessageManager] Unabled to fetch messages for the user; User is undefined.');
            return new Map();
        }

        const ApplicableMessages = new Map(
            Array.from(this.messages.entries())
                .filter(
                    ([Message_ID, Message]) =>
                        !Message.Message?.Private ||
                        (Message.Message?.Private && Message.Message.Private_To === User.User_ID)
                )
                .slice(-this.messagesToShow)
                .map(([Message_ID, Message]) => [Message_ID, Message])
        );

        console.log(`[Chat | Server | MessageManager] Fetched messages for ${User.Username}:`, ApplicableMessages);

        this.messages = ApplicableMessages;

        return this.messages;
    }

    /**
     * Constructs a message from a user.
     */
    public SendMessage(
        Message: string,
        Sent_By: UserInterface,
        Is_Private?: boolean,
        Private_To?: number
    ): MessageInterface {
        const MessageContent = this.messageHandler.SendMessage(Message, Sent_By, Is_Private, Private_To);
        this.AddMessage(MessageContent);

        console.log('[Chat | Server] Sending message:', MessageContent);

        return MessageContent;
    }

    /**
     * Constructs a message from Absol bot.
     */
    public SendBotMessage(Message: string, Is_Private?: boolean, Private_To?: number): MessageInterface {
        const MessageContent = this.messageHandler.SendBotMessage(Message, Is_Private, Private_To);
        this.AddMessage(MessageContent);

        console.log('[Chat | Server] Sending bot message:', MessageContent);

        return MessageContent;
    }

    /**
     * Sends a notification to all users that chat has been cleared.
     */
    public NotifyChatCleared(clearedBy: UserInterface): MessageInterface {
        const notificationMessage = `Chat has been cleared by ${clearedBy.Username}.`;
        const botMessage = this.SendBotMessage(notificationMessage);

        console.log(`[Chat | Server | MessageManager] Chat has been cleared by ${clearedBy.Username}.`);

        return botMessage;
    }
}
