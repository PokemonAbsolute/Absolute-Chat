import { Socket } from 'socket.io';

import Absol from './Absol';

import { MessageManager } from './MessageManager';

import { SocketAuth } from './events/SocketAuth';
import { SocketDisconnect } from './events/SocketDisconnect';
import { SocketChatMessage } from './events/SocketChatMessage';

export class SocketEvents {
    private absol: Absol;
    private socket: Socket;

    //
    private messageManager: MessageManager;

    //
    public auth: SocketAuth;
    public disconnect: SocketDisconnect;
    public chatMessage: SocketChatMessage;

    /**
     * Constructor
     */
    constructor(absol: Absol, socket: Socket, messageManager: MessageManager) {
        this.absol = absol;
        this.socket = socket;

        //
        this.messageManager = messageManager;

        //
        this.auth = new SocketAuth(this.absol, this.socket);
        this.disconnect = new SocketDisconnect(this.absol, this.socket);
        this.chatMessage = new SocketChatMessage(this.absol, this.socket, this.messageManager);
    }
}
