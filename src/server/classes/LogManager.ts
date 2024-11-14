import { AES } from 'crypto-js';

import DatabaseManager from './DatabaseManager';

import { UserInterface } from '../types/UserInterface';

export default class Log {
    public static async ToDatabase(
        message: string,
        sentBy: UserInterface,
        sentOn: number,
        isPrivate: boolean,
        privateTo: number
    ): Promise<void> {
        const ENCRYPTED_MESSAGE = AES.encrypt(message, sentBy.toString()).toString();

        await DatabaseManager.doQuery(
            'INSERT INTO `chat_logs` (`Message`, `Sent_By`, `Sent_On`, `Is_Private`, `Private_To`) VALUES (?, ?, ?, ?, ?)',
            [ENCRYPTED_MESSAGE, sentBy.User_ID, sentOn, isPrivate, privateTo]
        );
    }
}
