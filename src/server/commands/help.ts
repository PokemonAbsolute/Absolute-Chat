import fs from 'fs';
import path from 'path';

export = {
  name: 'help',
  description: 'Lists all available chat commands.',
  args: false,

  execute: () => {
    const COMMANDS = fs
      .readdirSync(path.join(__dirname, '..', 'commands'))
      .filter((file) => file.endsWith('.ts'));

    let messageData: string = '';

    COMMANDS.forEach((v, k) => {
      messageData += `${v.slice(0, -3)}, `;
    });

    messageData = messageData.slice(0, -2);

    return {
      message: `<b><u>Available Chat Commands</u></b> ${messageData}`,
    };
  },
};
