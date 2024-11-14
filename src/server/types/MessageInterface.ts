import { UserInterface } from './UserInterface';

export default interface MessageInterface {
    userID: number | undefined;
    userName: string | undefined;
    userRank: string | undefined;
    userAvatar: string | undefined;
    messageText: string;
    isPrivate: boolean;
    isPrivateTo: number;
    sentOn: number;
}

export interface InputMessageInterface {
    user: UserInterface;
    text: string;
}
