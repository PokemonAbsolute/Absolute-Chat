import { Socket } from 'socket.io';

import Absol from '../Absol';

export class SocketDisconnect {
    private absol: Absol;
    private socket: Socket;

    constructor(absol: Absol, socket: Socket) {
        this.absol = absol;
        this.socket = socket;
    }

    public Initialize(): void {
        console.log("[Chat | Server | SocketDisconnect] Watching for 'disconnect' events.");

        this.socket.on('disconnect', async (): Promise<void> => {
            const DisconnectedUser = this.absol.connectedUsers.get(this.socket.id);
            if (typeof DisconnectedUser === 'undefined') {
                return;
            }

            DisconnectedUser.Connected = false;
            this.absol.connectedUsers.delete(this.socket.id);

            console.log(
                '[Chat | Server] User disconnected:',
                DisconnectedUser.Username,
                `(${this.socket.id})`
            );
        });
    }
}
