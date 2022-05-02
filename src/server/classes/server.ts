import * as http from 'http';
import { Server, Socket } from 'socket.io';

import User from './user';
import MessageHandler from './message-handler';

import { INIT_COMMANDS } from '../util/get-commands';

import MessageInterface, { InputMessageInterface } from '../types/message';

export default class Absol {
  private server: Server | undefined;
  private messageHandler: MessageHandler;

  private clientPool: User[] = [];
  private messagePool: MessageInterface[] = [];

  private commandList: Map<any, any> | undefined = undefined;

  constructor() {
    this.messageHandler = new MessageHandler();
    this.commandList = INIT_COMMANDS();
  }

  start(server: http.Server, initType: string): void {
    /**
     * Create a new server instance.
     */
    this.server = new Server(server, {
      allowEIO3: true,
      connectTimeout: 30000,
      cors: {
        origin: [
          'http://localhost',
          'https://absoluterpg.com',
          'https://www.absoluterpg.com',
        ],
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

        this.clientPool.push(client);

        console.log('[Server] Available Commands:', this.commandList);
      });

      /**
       * Handle the disconnection of a client.
       */
      socket.on('disconnect', (): void => {
        if (typeof client !== 'undefined') {
          this.clientPool = this.clientPool.filter(
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

          const MESSAGE_DATA = this.messageHandler.sendMessage;
        }
      );
    });

    /**
     * Emit a welcoming message when the server initially boots.
     */
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
