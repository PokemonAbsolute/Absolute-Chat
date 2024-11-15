import User from './UserManager';
import Log from './LogManager';

import { MessageInterface } from '../types/MessageInterface';

import { UserMessageInterface } from '../types/UserInterface';

class Message {
    private message: string;
    private sentOn: number;
    private isPrivate: boolean = false;
    private isPrivateTo: number;

    constructor(message: string, isPrivate?: boolean, isPrivateTo?: number) {
        this.message = message;
        this.sentOn = new Date().getTime();
        this.isPrivate = isPrivate ?? false;
        this.isPrivateTo = isPrivateTo ?? -1;
    }

    public fromUser(sentBy: User): MessageInterface {
        if (typeof sentBy.userData !== 'undefined') {
            Log.ToDatabase(
                this.message,
                sentBy.userData,
                this.sentOn,
                this.isPrivate,
                this.isPrivateTo
            );
        }

        return {
            User: {
                User_ID: sentBy.userData!.User_ID,
                Username: sentBy.userData!.Username,
                Rank: sentBy.userData!.Rank,
                Avatar: sentBy.userData!.Avatar,
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
        sentBy: User,
        isPrivate?: boolean,
        isPrivateTo?: number
    ): MessageInterface {
        return new Message(message, isPrivate, isPrivateTo).fromUser(sentBy);
    }

    public SendBotMessage(
        message: string,
        isPrivate?: boolean,
        isPrivateTo?: number
    ): MessageInterface {
        return new Message(message, isPrivate, isPrivateTo).fromBot();
    }
}
