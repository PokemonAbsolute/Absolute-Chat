import DatabaseManager from '../classes/DatabaseManager';

export const GetRandomPokemon = async () => {
    const MYSQL_QUERY: string = 'SELECT `Pokemon`, `Forme` FROM `pokedex` ORDER BY RAND() LIMIT 1';
    const MYSQL_PARAMS: string[] = [];

    let RANDOM_POKEMON: any[] | undefined;
    try {
        RANDOM_POKEMON = await DatabaseManager.doQuery(MYSQL_QUERY, MYSQL_PARAMS);
    } catch (err) {
        console.log(
            '[Util | GetRandomPokemon] Unable to process SQL query:',
            MYSQL_QUERY,
            MYSQL_PARAMS,
            err
        );
    }

    return RANDOM_POKEMON;
};
