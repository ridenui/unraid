import { SystemModule } from '../modules/system/system-module';
import { UnraidModule } from '../modules/unraid/unraid-module';
import { VMModule } from '../modules/vms/vm-module';
import { PropType, Type } from '../util';
import { Executor, ExecutorConfigType, IExecute, IExecuteResult, IExecuteSimple } from './executor';

export interface UnraidConfig<
  ExecutorConfig extends ExecutorConfigType = ExecutorConfigType,
  Ex extends Executor = Executor<ExecutorConfig>
> {
  /**
   * Specify which {@link Executor} to use.
   * For nodejs use the builtin {@link SSHExecutor} which uses [ssh2](https://github.com/mscdex/ssh2) under the hood.
   * You can also provide a custom {@link Executor} implementation.
   */
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

  /**
   * If you want to interact with virtual machines on unraid, use this
   *
   * @category VM
   */
  readonly vm: VMModule;

  /**
   * Everything general system related
   * These methods are more unraid independent and may also work on other systems
   * Basically general unix system functions
   *
   * @category System
   */
  readonly system: SystemModule;

  /**
   * Unraid specific functions
   *
   * @category Unraid
   */
  readonly unraid: UnraidModule;

  constructor(config: UnraidConfig<ExecutorConfig, Ex>) {
    const ExecutorClass = config.executor;
    this.executor = new ExecutorClass(config.executorConfig);
    this.vm = new VMModule(this);
    this.system = new SystemModule(this);
    this.unraid = new UnraidModule(this);
  }

  /**
   * @ignore
   */
  async execute(command: IExecuteSimple): Promise<IExecuteResult>;

  /**
   * @ignore
   */
  async execute({ command }: IExecute): Promise<IExecuteResult>;

  /**
   * @ignore
   */
  async execute(command: IExecuteSimple | IExecute): Promise<IExecuteResult> {
    return this.executor.execute(command);
  }
}
