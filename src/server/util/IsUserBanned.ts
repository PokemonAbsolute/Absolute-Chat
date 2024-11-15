import DatabaseManager from '../classes/DatabaseManager';

export const IsUserBanned = async (User_ID: number): Promise<boolean> => {
    const BAN_DATA: any[] | undefined = await DatabaseManager.doQuery(
        'SELECT * FROM `user_bans` WHERE `User_ID` = ? AND (`RPG_Ban` = 1 OR `Chat_Ban` = 1) LIMIT 1',
        [User_ID]
    );

    if (typeof BAN_DATA === 'undefined' || BAN_DATA.length === 0) {
        return false;
    }

    return true;
};
