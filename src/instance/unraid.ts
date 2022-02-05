import { SystemModule } from '../modules/system/system-module';
import { UnraidModule } from '../modules/unraid/unraid-module';
import { VMModule } from '../modules/vms/vm-module';
import { PropType, Type } from '../util';
import { Executor, ExecutorConfigType, IExecute, IExecuteResult, IExecuteSimple } from './executor';

export interface UnraidConfig<
  ExecutorConfig extends ExecutorConfigType = ExecutorConfigType,
  Ex extends Executor = Executor<ExecutorConfig>
> {
  executor: Type<Ex>;
  executorConfig: PropType<Ex, 'config'>;
}

export class Unraid<
  Ex extends Executor = Executor,
  ExecutorConfig extends ExecutorConfigType = PropType<Ex, 'config'>
> {
  /**
   * @private
   */
  readonly executor: Ex;

  readonly vm: VMModule;

  readonly system: SystemModule;

  readonly unraid: UnraidModule;

  constructor(config: UnraidConfig<ExecutorConfig, Ex>) {
    const ExecutorClass = config.executor;
    this.executor = new ExecutorClass(config.executorConfig);
    this.vm = new VMModule(this);
    this.system = new SystemModule(this);
    this.unraid = new UnraidModule(this);
  }

  /**
   * @private
   */
  async execute(command: IExecuteSimple): Promise<IExecuteResult>;

  /**
   * @private
   */
  async execute({ command }: IExecute): Promise<IExecuteResult>;

  /**
   * @private
   */
  async execute(command: IExecuteSimple | IExecute): Promise<IExecuteResult> {
    return this.executor.execute(command);
  }
}
