import MySQL from '../../classes/mysql';

import { lastSeenOn } from '../../util/last-seen';

export = {
    name: 'lastseen',
    description: 'Calculates when the user was last seen.',
    cooldown: 1,

    args: true,

    execute: async (args: string[]) => {
        const USER_IDENTIFIER: string = args[0].toLocaleString();
        const USER_LAST_SEEN: any = await MySQL.doQuery(
            'SELECT `Username`, `Last_Active` FROM `users` WHERE `ID` = ? OR UPPER(`Username`) = UPPER(?) LIMIT 1',
            [USER_IDENTIFIER, USER_IDENTIFIER]
        );

        if (typeof USER_LAST_SEEN === 'undefined') {
            return {
                message: 'Unable to process your command.',
            };
        }

        const LAST_SEEN_DATE = lastSeenOn(USER_LAST_SEEN[0].Last_Active);

        return {
            message: `
                <b>${USER_LAST_SEEN[0].Username}</b> was last seen ${LAST_SEEN_DATE}.
            `,
        };
    },
};
