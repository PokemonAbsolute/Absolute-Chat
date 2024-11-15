import { Socket } from 'socket.io';

import Absol from '../Absol';

import User from '../UserManager';

import { UserInterface } from '../../types/UserInterface';

export class SocketAuth {
    private absol: Absol;
    private socket: Socket;

    constructor(absol: Absol, socket: Socket) {
        this.absol = absol;
        this.socket = socket;
    }

    public Initialize(): void {
        console.log("[Chat | Server | SocketAuth] Watching for 'auth' events.");

        this.socket.on('auth', async (AuthenticatingUser: UserInterface): Promise<void> => {
            const client = new User(AuthenticatingUser.User_ID, AuthenticatingUser.Auth_Code);
            if (!(await client.init()) || typeof client.userData == 'undefined') {
                return;
            }

            console.log(
                '[Chat | Server | SocketAuth] New client connected:',
                client.userData.Username,
                `(${this.socket.id})`
            );

            this.absol.connectedUsers.set(this.socket.id, client.userData);
            const messageHistory = this.absol.messageManager.FetchMessages(client.userData);

            if (messageHistory.size > 0) {
                this.socket.emit('chat-message', messageHistory.get(0)!);
                this.absol.messageManager.AddMessage(messageHistory.get(0)!);
            }
        });
    }
}
