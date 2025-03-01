import { GetRandomPokemon } from '../../util/GetRandomPokemon';

export = {
    name: 'randpkmn',
    description: 'Fetches a random Pokemon species.',
    cooldown: 1,

    args: false,

    execute: async () => {
        let RANDOM_POKEMON: any[] | undefined = await GetRandomPokemon();

        if (typeof RANDOM_POKEMON === 'undefined') {
            return {
                message: 'An error occurred processing your command.',
            };
        }

        const FORME = RANDOM_POKEMON[0].FORME ?? '';
        const POKEMON_NAME = RANDOM_POKEMON[0].Pokemon + FORME;

        return {
            message: `
              <b style='display: block'>Random Pok&eacute;mon:</b>
              ${POKEMON_NAME}
            `,
        };
    },
};
