import { getPokemonRarity } from '../../util/get-pokemon-rarity';

export = {
    name: 'rarity',
    description: 'Fetches the rarity of a given Pokemon species.',
    cooldown: 1,

    args: true,

    execute: async (args: string[]) => {
        let RARITY_DATA: any[] | undefined;
        switch (args.length) {
            case 1:
                RARITY_DATA = await getPokemonRarity(args[0]);
                break;

            case 2:
                RARITY_DATA = await getPokemonRarity(args[0], args[1]);
                break;

            default:
                return {
                    message: 'Try again. ~rarity SPECIES FORME',
                };
        }

        if (typeof RARITY_DATA === 'undefined') {
            return {
                message: 'An error occurred processing your command.',
            };
        }

        return {
            message: `
                <b style='display: block;'>${args[0]}'s Rarity Data</b>
                <b>Total</b>: ${RARITY_DATA[0]?.TOTAL?.toLocaleString() ?? 0} |
                <b>Normal</b>: ${RARITY_DATA[0]?.NORMAL?.toLocaleString() ?? 0} |
                <b>Shiny</b>: ${RARITY_DATA[0]?.SHINY?.toLocaleString() ?? 0}
            `,
        };
    },
};
