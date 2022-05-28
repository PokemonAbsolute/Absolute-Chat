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
    await MySQL.doQuery(
      'INSERT INTO `chat_logs` (`Message`, `Sent_By`, `Sent_On`, `Is_Private`, `Private_To`, `Is_Command`) VALUES (?, ?, ?, ?, ?)',
      [message, sentBy.ID, sentOn, isPrivate, privateTo]
    );
  }
}
