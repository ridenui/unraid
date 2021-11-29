export type IExecute = {
  command: string;
};

export type IExecuteResult = {
  stdout: string[];
  stderr: string[];
  code: number;
  signal?: unknown;
};

export type IExecuteSimple = string;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IExecutorConfig {}

export abstract class Executor<Config extends IExecutorConfig> {
  config: Config;

  // eslint-disable-next-line no-useless-constructor
  constructor(config: Config) {
    this.config = config;
  }

  abstract execute(command: IExecuteSimple): Promise<IExecuteResult>;

  abstract execute({ command }: IExecute): Promise<IExecuteResult>;

  abstract execute(command: IExecuteSimple | IExecute): Promise<IExecuteResult>;
}
