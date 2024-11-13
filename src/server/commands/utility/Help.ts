import fs from 'fs';
import path from 'path';

export = {
    name: 'help',
    description: 'Lists all available chat commands.',
    cooldown: 1,

    args: false,

    execute: () => {
        let messageData: string = '';

        const commandsPath = path.join(__dirname, '..');
        const commandCategories = fs.readdirSync(commandsPath);

        for (const category of commandCategories) {
            const categoryPath = path.join(commandsPath, category);

            if (!fs.statSync(categoryPath).isDirectory()) {
                continue;
            }

            const commandFiles = fs
                .readdirSync(categoryPath)
                .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

            for (const file of commandFiles) {
                messageData += `${file.slice(0, -3)}, `;
            }
        }

        messageData = messageData.slice(0, -2);

        return {
            message: `<b><u>Available Chat Commands</u></b> ${messageData}`,
        };
    },
};
