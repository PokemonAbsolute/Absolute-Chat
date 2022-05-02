import * as http from 'http';
import { Server, Socket } from 'socket.io';

import User from './user';

export default class Absol {
  server: Server | undefined;
  client: User | undefined;
  messages: [] | undefined;

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
      /**
       * Handle the initial authentication of the client.
       */
      socket.on('auth', async (authObject) => {
        console.log('[Server] Client Auth', authObject);

        this.client = new User(authObject.user, authObject.postcode);
        console.log(this.client);

        if (!(await this.client.init())) {
          console.log('[Server] Client failed auth check.', authObject);

          return;
        }

        console.log('[Server] Client passed auth check.', this.client.userData);
      });

      /**
       * Handle the disconnection of a client.
       */
      socket.on('disconnect', (): void => {
        console.log('[Server] Client Disconnected.');
      });

      /**
       * Handle the emitted chat-message.
       */
      socket.on('chat-message', async (chatData: any): Promise<void> => {
        console.log('[Server] Client Chat Message', chatData);
      });
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
