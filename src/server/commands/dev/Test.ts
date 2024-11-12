export = {
    name: 'test',
    description: 'Generic test command.',
    cooldown: 0,

    args: false,

    execute: () => {
        return {
            message: 'Test command executed.',
        };
    },
};
