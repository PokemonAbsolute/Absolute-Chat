import * as http from 'http';

import Absol from './Absol';

import DatabaseManager from './DatabaseManager';

export class NotificationManager {
    private AbsolInstance: Absol;

    constructor(AbsolInstance: Absol) {
        this.AbsolInstance = AbsolInstance;
    }

    public PollNotifications(): void {
        setInterval(async () => {
            if (DatabaseManager.instance.isConnected()) {
                try {
                    const notifications: any[] | undefined = await DatabaseManager.doQuery(
                        'SELECT `id`, `message`, `metadata` FROM `system_notifications` WHERE `processed` = 0 ORDER BY `created_at` ASC LIMIT 10',
                        []
                    );

                    if (typeof notifications === 'undefined') {
                        return false;
                    }

                    for (const notification of notifications) {
                        const botMessage = this.AbsolInstance.messageManager.SendBotMessage(
                            notification.message
                        );

                        this.AbsolInstance.server!.emit('chat-message', botMessage);

                        await DatabaseManager.doQuery(
                            'UPDATE `system_notifications` SET `processed` = 1, `processed_at` = ? WHERE `id` = ?',
                            [Math.floor(Date.now() / 1000), notification.id]
                        );
                    }
                } catch (error) {
                    console.error('[Chat | Server] Error processing notifications:', error);
                }
            }
        }, 1000);
    }
}
