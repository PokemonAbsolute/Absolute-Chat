import { AES, enc } from 'crypto-js';

import MySQL from './mysql';

import UserInterface from '../types/user';

export default class Log {
  public static async toDatabase(
    message: string,
    sentBy: UserInterface,
    sentOn: number,
    isPrivate: boolean,
    privateTo: number
  ): Promise<void> {
    const ENCRYPTED_MESSAGE = AES.encrypt(
      message,
      sentBy.toString()
    ).toString();

    await MySQL.doQuery(
      'INSERT INTO `chat_logs` (`Message`, `Sent_By`, `Sent_On`, `Is_Private`, `Private_To`) VALUES (?, ?, ?, ?, ?)',
      [ENCRYPTED_MESSAGE, sentBy.ID, sentOn, isPrivate, privateTo]
    );
  }
}
