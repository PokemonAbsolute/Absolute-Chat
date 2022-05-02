import * as http from 'http';
import { Server, Socket } from 'socket.io';

import User from './user';

import { InputMessageInterface } from '../types/message';

export default class Absol {
  server: Server | undefined;
  clients: User[] = [];
  messages: [] = [];

  start(server: http.Server, initType: string): void {
    this.server = new Server(server, {
      allowEIO3: true,
      connectTimeout: 30000,
      cors: {
        origin: 'http://localhost',
        credentials: true,
      },
    });

    /**
     * Handle connections to the server.
     */
    this.server.on('connection', (socket: Socket): void => {
      let client: User;

      /**
       * Handle the initial authentication of the client.
       */
      socket.on('auth', async (authObject) => {
        client = new User(authObject.user, authObject.postcode);
        if (!(await client.init())) {
          return;
        }

        this.clients.push(client);
      });

      /**
       * Handle the disconnection of a client.
       */
      socket.on('disconnect', (): void => {
        if (typeof client !== 'undefined') {
          this.clients = this.clients.filter(
            (tClient) => tClient.userData?.ID !== client.userData?.ID
          );
        }
      });

      /**
       * Handle the emitted chat-message.
       */
      socket.on(
        'chat-message',
        async (chatData: InputMessageInterface): Promise<void> => {
          console.log('[Server] Client Chat Message', chatData);
        }
      );
    });

    switch (initType) {
      case 'debug':
        console.log('[Server] Debug mode. Emit message.');
        break;

      case 'update':
        console.log('[Server] Updated! Emit message.');
        break;

      default:
        console.log('[Server] Absolute Chat is online. Emit message.');
        break;
    }
  }
}
