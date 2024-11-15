import { UserInterface, UserMessageInterface } from './UserInterface';

export interface Message {
    ID?: number;
    Text: string;
    Private?: boolean;
    Private_To?: number;
    Timestamp?: number;
}

export interface MessageInterface {
    User: UserMessageInterface;
    Message: Message;
}

export interface InputMessageInterface {
    User: UserInterface;
    Message: Message;
}
