import { SystemModule } from '../modules/system/system-module';
import { UnraidModule } from '../modules/unraid/unraid-module';
import { VMModule } from '../modules/vms/vm-module';
import { Type } from '../util';
import { Executor, IExecute, IExecuteResult, IExecuteSimple } from './executor';

export interface UnraidConfig<ExecutorConfig, Ex extends Executor<ExecutorConfig>> {
  executor: Type<Ex>;
  executorConfig: ExecutorConfig;
}

export class Unraid<ExecutorConfig, Ex extends Executor<ExecutorConfig>> {
  readonly executor: Ex;

  readonly vm: VMModule<ExecutorConfig, Ex>;

  readonly system: SystemModule<ExecutorConfig, Ex>;

  readonly unraid: UnraidModule<ExecutorConfig, Ex>;

  constructor(config: UnraidConfig<ExecutorConfig, Ex>) {
    // eslint-disable-next-line new-cap
    this.executor = new config.executor(config.executorConfig);
    this.vm = new VMModule<ExecutorConfig, Ex>(this);
    this.system = new SystemModule<ExecutorConfig, Ex>(this);
    this.unraid = new UnraidModule<ExecutorConfig, Ex>(this);
  }

  async execute(command: IExecuteSimple): Promise<IExecuteResult>;

  async execute({ command }: IExecute): Promise<IExecuteResult>;

  async execute(command: IExecuteSimple | IExecute): Promise<IExecuteResult> {
    return this.executor.execute(command);
  }
}
