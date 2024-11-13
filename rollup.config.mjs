import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/client/client.ts',
    output: {
        file: 'build/client/client.js',
        format: 'iife',
        name: 'AbsoluteChatClient',
        globals: {
            'socket.io-client': 'io',
        },
    },
    plugins: [
        typescript({
            tsconfig: 'src/client/tsconfig.json',
        }),
    ],
    external: ['socket.io-client'],
};
