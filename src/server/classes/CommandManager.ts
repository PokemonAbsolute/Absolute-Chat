import fs from 'fs';
import path from 'path';

import { Server as SocketServer } from 'socket.io';

import Server from './server';
import MessageHandler from './message-handler';
import Log from './log';

import { CommandInterface } from '../types/command';
import { InputMessageInterface } from '../types/message';
import UserInterface from '../types/user';

/**
 * The CommandManager class handles the loading, unloading, and execution of commands.
 */
export class CommandManager {
    private absolServer: Server;
    private socketServer: SocketServer;
    private messageHandler: MessageHandler;

    private commands: Map<any, any> = new Map();
    private categories: Map<string, any> = new Map();
    private cooldowns: Map<string, any> = new Map();

    private commandPrefix: string = '!';

    constructor(absolServer: Server, socketServer: SocketServer, messageHandler: MessageHandler) {
        this.absolServer = absolServer;
        this.socketServer = socketServer;
        this.messageHandler = messageHandler;
    }

    /**
     * Loads all commands from the /commands directory and all subdirectories.
     */
    public async LoadCommands(): Promise<void> {
        const commandsPath = path.join(__dirname, '../commands');
        const commandCategories = fs.readdirSync(commandsPath);

        for (const category of commandCategories) {
            const categoryPath = path.join(commandsPath, category);

            if (!fs.statSync(categoryPath).isDirectory()) {
                continue;
            }

            this.categories.set(category, new Map());

            const commandFiles = fs
                .readdirSync(categoryPath)
                .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

            for (const file of commandFiles) {
                const commandPath = path.join(categoryPath, file);
                const command: CommandInterface = require(commandPath);

                if ('execute' in command) {
                    this.commands.set(command.name, command);
                    this.categories.get(category).set(command.name, command);

                    console.log(`Loaded command: ${command.name}`);
                } else {
                    console.warn(`Failed to load command: ${commandPath}`);
                    console.warn(command);
                }
            }
        }
    }

    /**
     * Handles the cooldown of a command.
     */
    private async HandleCooldown(
        command: CommandInterface,
        user: UserInterface,
        cooldownModifier: number
    ): Promise<void> {
        if (!this.cooldowns.has(command.name)) {
            this.cooldowns.set(command.name, new Map());
        }

        const now = Date.now();
        const timestamps = this.cooldowns.get(command.name);
        const cooldownAmount =
            (command?.cooldown ?? 3) * (user.Rank != 'Member' ? 0 : cooldownModifier);

        if (timestamps.has(user.ID)) {
            const expirationTime = timestamps.get(user.ID) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;

                console.warn(
                    `User ${user.ID} is on cooldown for command ${
                        command.name
                    }. Time left: ${timeLeft.toFixed(1)}s`
                );

                return;
            }
        }

        timestamps.set(user.ID, now);
        setTimeout(() => timestamps.delete(user.ID), cooldownAmount);
    }

    /**
     * Executes a command.
     */
    public async ProcessCommand(messageData: InputMessageInterface): Promise<any> {
        if (!messageData.text.startsWith(this.commandPrefix)) {
            return;
        }

        const commandArguments = messageData.text.slice(this.commandPrefix.length).split(' ');
        const commandName = commandArguments.shift()?.toLowerCase();
        const commandData = this.commands.get(commandName);

        if (typeof commandData == 'undefined') {
            console.warn(
                `[CommandManager | ProcessCommand] Command not found: ${commandName} (User ID: ${messageData.user.ID})`
            );
            return;
        }

        await this.HandleCooldown(commandData, messageData.user, 1);

        const commandResponse = await commandData.execute(commandArguments);

        return commandResponse.message;
    }
}
