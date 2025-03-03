export = {
    name: 'clear',
    description: 'Clears the chat message history.',
    cooldown: 5,

    args: false,

    execute: async () => {
        return {
            clearMessages: true,
        };
    },
};
