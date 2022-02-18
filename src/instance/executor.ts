import type { EventEmitter } from 'events';

export type IExecute = {
    command: string;
};

export type IExecuteResult = {
    stdout: string[];
    stderr: string[];
    code: number;
    signal?: unknown;
};

export type IExecuteStreamResult = {
    code: number;
    signal?: unknown;
};

export type IExecuteSimple = string;

export type CancelFunction = () => Promise<void>;

export type ExecutorConfigType = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Executor<Config> {
    executeStream?(
        command: IExecuteSimple | IExecute
    ): Promise<[EventEmitter, CancelFunction, Promise<IExecuteStreamResult>]>;
}

export abstract class Executor<Config extends ExecutorConfigType = ExecutorConfigType> {
    readonly config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    abstract execute(command: IExecuteSimple): Promise<IExecuteResult>;

    abstract execute({ command }: IExecute): Promise<IExecuteResult>;

    abstract execute(command: IExecuteSimple | IExecute): Promise<IExecuteResult>;
}
