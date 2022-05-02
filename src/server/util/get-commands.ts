import fs from 'fs';
import path from 'path';

export const INIT_COMMANDS = () => {
  const COMMAND_LIST = new Map();

  const COMMANDS = fs
    .readdirSync(path.join(__dirname, '..', 'commands'))
    .filter((file) => file.endsWith('.ts'));

  for (const FILE of COMMANDS) {
    const COMMAND = require(path.resolve(`./src/server/commands/${FILE}`));
    COMMAND_LIST.set(COMMAND.name + '.js', COMMAND);
  }

  return COMMAND_LIST;
};
