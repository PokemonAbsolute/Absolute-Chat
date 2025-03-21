import DatabaseManager from './DatabaseManager';

import { UserInterface } from '../types/UserInterface';
import BanInterface from '../types/BanInterface';

export default class User {
    private userID: number;
    private sentAuthCode: string;

    public userData: UserInterface | undefined;
    public banData: BanInterface | undefined;

    constructor(userID: number, authCode: string) {
        this.userID = userID;
        this.sentAuthCode = authCode;
    }

    public async auth(authCode: string): Promise<boolean> {
        if (this.sentAuthCode == authCode) {
            return true;
        }

        return false;
    }

    public async init(): Promise<boolean> {
        const USER_DATA: any[] | undefined = await DatabaseManager.doQuery(
            'SELECT `ID` as `User_ID`, `Username`, `Rank`, `Auth_Code`, `Avatar` FROM `users` WHERE `ID` = ? LIMIT 1',
            [this.userID]
        );

        if (typeof USER_DATA === 'undefined') {
            return false;
        }

        if (!(await this.auth(USER_DATA[0].Auth_Code))) {
            return false;
        }

        this.userData = USER_DATA[0];
        if (typeof this.userData != 'undefined') {
            this.userData.Connected = true;
        }

        return true;
    }

    public async ban(reason: string, duration: number, bannedBy: number): Promise<boolean> {
        if (typeof this.userData === 'undefined') {
            return false;
        }

        await DatabaseManager.doQuery(
            'INSERT INTO `user_bans` (`User_ID`, `Banned_By`, `Banned_On`, `Chat_Ban`, `Chat_Ban_Reason`, `Chat_Ban_Until`) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `Banned_By`, `Banned_On`, `Chat_Ban`, `Chat_Ban_Reason`, `Chat_Ban_Until`',
            [
                this.userData.User_ID,
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

        const BAN_DATA: any[] | undefined = await DatabaseManager.doQuery(
            'SELECT * FROM `user_bans` WHERE `User_ID` = ? AND (`RPG_Ban` = 1 OR `Chat_Ban` = 1) LIMIT 1',
            [this.userData.User_ID]
        );

        if (typeof BAN_DATA === 'undefined' || BAN_DATA?.length === 0) {
            return false;
        }

        this.banData = BAN_DATA[0];
        return true;
    }
}
