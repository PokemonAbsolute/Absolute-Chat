import Log from './LogManager';

import { MessageInterface } from '../types/MessageInterface';

import { UserInterface, UserMessageInterface } from '../types/UserInterface';

class Message {
    private message: string;
    private sentOn: number;
    private isPrivate: boolean = false;
    private isPrivateTo: number = -1;

    constructor(message: string, isPrivate?: boolean, isPrivateTo?: number) {
        this.message = message;
        this.sentOn = new Date().getTime();
        this.isPrivate = isPrivate ?? false;
        this.isPrivateTo = isPrivateTo ?? -1;
    }

    public fromUser(sentBy: UserInterface): MessageInterface {
        if (typeof sentBy !== 'undefined') {
            Log.ToDatabase(this.message, sentBy, this.sentOn, this.isPrivate, this.isPrivateTo);
        }

        return {
            User: {
                User_ID: sentBy!.User_ID,
                Username: sentBy!.Username,
                Rank: sentBy!.Rank,
                Avatar: sentBy!.Avatar,
            },
            Message: {
                ID: -1,
                Text: this.message,
                Private: this.isPrivate,
                Private_To: this.isPrivateTo,
                Timestamp: this.sentOn,
            },
        };
    }

    public fromBot(): MessageInterface {
        const sentBy: UserMessageInterface = {
            User_ID: -1,
            Username: 'Absol',
            Rank: 'Bot',
            Auth_Code: 'AbsolBotAuthCode',
            Avatar: '/Avatars/Custom/3.png',
            Connected: true,
        };

        Log.ToDatabase(this.message, sentBy, this.sentOn, this.isPrivate, this.isPrivateTo);

        return {
            User: {
                User_ID: sentBy.User_ID,
                Username: sentBy.Username,
                Rank: sentBy.Rank,
                Avatar: sentBy.Avatar,
            },
            Message: {
                ID: -1,
                Text: this.message,
                Private: this.isPrivate,
                Private_To: this.isPrivateTo,
                Timestamp: this.sentOn,
            },
        };
    }
}

export class MessageHandler {
    public SendMessage(
        message: string,
        sentBy: UserInterface,
        isPrivate?: boolean,
        isPrivateTo?: number
    ): MessageInterface {
        return new Message(message, isPrivate, isPrivateTo).fromUser(sentBy);
    }

    public SendBotMessage(message: string, isPrivate?: boolean, isPrivateTo?: number): MessageInterface {
        return new Message(message, isPrivate, isPrivateTo).fromBot();
    }
}
