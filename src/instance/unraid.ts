import { Type } from '../util';
import { Executor, IExecute, IExecuteResult, IExecuteSimple, IExecutorConfig } from './executor';

interface UnraidConfig<Ex extends Executor<unknown>> {
  executor: Type<Ex>;
  executorConfig: IExecutorConfig;
}

export class Unraid<Ex extends Executor<unknown>> {
  private executor: Ex;

  constructor(config: UnraidConfig<Ex>) {
    // eslint-disable-next-line new-cap
    this.executor = new config.executor(config.executorConfig);
  }

  async execute(command: IExecuteSimple): Promise<IExecuteResult>;

  async execute({ command }: IExecute): Promise<IExecuteResult>;

  async execute(command: IExecuteSimple | IExecute): Promise<IExecuteResult> {
    return this.executor.execute(command);
  }
}
