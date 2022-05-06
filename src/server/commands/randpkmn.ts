import { getRandomPokemon } from '../util/get-random-pokemon';

export = {
  name: 'randpkmn',
  description: 'Fetches a random Pokemon species.',
  args: false,

  execute: async () => {
    let RANDOM_POKEMON: any[] | undefined = await getRandomPokemon();

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
