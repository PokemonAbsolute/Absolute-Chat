import MySQL from '../classes/mysql';

import UserInterface from '../types/user';
import BanInterface from '../types/ban';

export default class User {
  private userID: number;
  private sentAuthCode: number;
  public userData: UserInterface | undefined;
  public banData: BanInterface | undefined;

  constructor(userID: number, authCode: number) {
    this.userID = userID;
    this.sentAuthCode = authCode;
  }

  public async auth(authCode: number): Promise<boolean> {
    if (this.sentAuthCode == authCode) {
      return true;
    }

    return false;
  }

  public async init(): Promise<boolean> {
    const USER_DATA: any[] | undefined = await MySQL.doQuery(
      'SELECT `ID`, `Username`, `Rank`, `Auth_Code` FROM `users` WHERE `ID` = ? LIMIT 1',
      [this.userID]
    );

    if (typeof USER_DATA === 'undefined') {
      return false;
    }

    if (!(await this.auth(USER_DATA[0].Auth_Code))) {
      return false;
    }

    this.userData = USER_DATA[0];
    return true;
  }

  public async ban(
    reason: string,
    duration: number,
    bannedBy: number
  ): Promise<boolean> {
    if (typeof this.userData === 'undefined') {
      return false;
    }

    await MySQL.doQuery(
      'INSERT INTO `user_bans` (`User_ID`, `Banned_By`, `Banned_On`, `Chat_Ban`, `Chat_Ban_Reason`, `Chat_Ban_Until`) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `Banned_By`, `Banned_On`, `Chat_Ban`, `Chat_Ban_Reason`, `Chat_Ban_Until`',
      [
        this.userData.ID,
        bannedBy,
        Math.floor(Date.now() / 1000),
        1,
        reason,
        Math.floor(Date.now() + duration / 1000),
      ]
    );

    return true;
  }

  public async getBan(): Promise<boolean> {
    if (typeof this.userData === 'undefined') {
      return false;
    }

    const BAN_DATA: any[] | undefined = await MySQL.doQuery(
      'SELECT `Banned_By`, `Banned_On`, `Chat_Ban`, `Chat_Ban_Until`, `Chat_Ban_Reason` FROM `user_bans` WHERE `User_ID` = ? LIMIT 1',
      [this.userData.ID]
    );

    if (typeof BAN_DATA === 'undefined') {
      return false;
    }

    this.banData = BAN_DATA[0];
    return true;
  }
}
