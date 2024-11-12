import User from './UserManager';
import Log from './LogManager';

import MessageInterface from '../types/MessageInterface';
import UserInterface from '../types/UserInterface';

class Message {
    private message: string;
    private sentOn: number;
    private isPrivate: boolean = false;
    private isPrivateTo: number;

    constructor(message: string, isPrivate?: boolean, isPrivateTo?: number) {
        this.message = message;
        this.sentOn = Date.now();
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
            userID: sentBy.userData?.ID,
            userName: sentBy.userData?.Username,
            userRank: sentBy.userData?.Rank,
            userAvatar: sentBy.userData?.Avatar,
            messageText: this.message,
            isPrivate: this.isPrivate,
            isPrivateTo: this.isPrivateTo,
            sentOn: this.sentOn,
        };
    }

    public fromBot(): MessageInterface {
        const sentBy: UserInterface = {
            ID: -1,
            Username: 'Absol',
            Rank: 'Bot',
            Auth_Code: 'AbsolBotAuthCode',
            Avatar: '/Avatars/Custom/3.png',
            Connected: true,
        };

        Log.ToDatabase(this.message, sentBy, this.sentOn, this.isPrivate, this.isPrivateTo);

        return {
            userID: sentBy.ID,
            userName: sentBy.Username,
            userRank: sentBy.Rank,
            userAvatar: sentBy.Avatar,
            messageText: this.message,
            isPrivate: this.isPrivate,
            isPrivateTo: this.isPrivateTo,
            sentOn: this.sentOn,
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
