export interface CommandInterface {
    name: string;
    description: string;
    cooldown?: number;

    args?: any;

    execute: Function;
}

export interface CommandResponse {
    message: string;
}
