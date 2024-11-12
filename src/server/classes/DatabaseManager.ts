import { config } from '../util/ValidateEnvironment';

import * as mysql from 'mysql2/promise';

export default class DatabaseManager {
    private static _instance: DatabaseManager;
    private connection: mysql.Connection | undefined;

    public static get instance(): DatabaseManager {
        return this._instance || (this._instance = new this());
    }

    public isConnected(): boolean {
        return this.connection !== null;
    }

    public static async doQuery(
        queryString: string,
        queryParams: any[]
    ): Promise<any[] | undefined> {
        try {
            const [rows, fields]: any = await this._instance.connection?.execute(
                queryString,
                queryParams
            );

            return rows as any[];
        } catch (error) {
            console.log(
                '[MySQL Query] An error occurred while performing a SQL quer. [Query]:',
                queryString,
                '[Params]:',
                queryParams,
                '[Error]:',
                error
            );
        }
    }

    public async connectDatabase(): Promise<void> {
        console.log('[Chat | Connection] Connecting to MySQL database for Absolute Chat...');

        return mysql
            .createConnection({
                host: config.DATABASE_HOST ?? 'localhost',
                user: config.DATABASE_USER ?? 'absolute',
                password: config.DATABASE_PASSWORD ?? 'qwerty',
                database: config.DATABASE_TABLE ?? 'absolute',
            })
            .then((connection: mysql.Connection): void => {
                console.log(
                    '[Chat | Connection] Successfully connected to MySQL database for Absolute Chat.'
                );
                this.connection = connection;
            })
            .catch((error: string): void => {
                console.log(
                    '[Chat | Connection] Failed to create MySQL connection for Absolute Chat. [Error]:',
                    error
                );
            });
    }
}
