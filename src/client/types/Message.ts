import { UserMessageInterface } from './User';

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
