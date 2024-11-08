import { config } from '../util/validate-env';

import * as mysql from 'mysql2/promise';

export default class MySQL {
    private static _instance: MySQL;
    private connection: mysql.Connection | undefined;

    public static get instance(): MySQL {
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
        console.log(
            '\t' + `DATABASE_HOST = ${config.DATABASE_HOST}`,
            '\t' + `DATABASE_USER = ${config.DATABASE_USER}`,
            '\t' + `DATABASE_PASSWORD = ${config.DATABASE_PASSWORD}`,
            '\t' + `DATABASE_TABLE = ${config.DATABASE_TABLE}`
        );

        return mysql
            .createConnection({
                host: config.DATABASE_HOST ?? 'localhost',
                user: config.DATABASE_USER ?? 'absolute',
                password: config.DATABASE_PASSWORD ?? 'qwerty',
                database: config.DATABASE_TABLE ?? 'absolute',
            })
            .then((connection): void => {
                this.connection = connection;
            })
            .catch((error): void => {
                console.log(
                    '[Chat | Connection] Failed to create MySQL connection for Absolute Chat. [Error]:',
                    error
                );
            });
    }
}
