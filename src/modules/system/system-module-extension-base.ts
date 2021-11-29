import { Executor } from '../../instance/executor';
import { Unraid } from '../../instance/unraid';

export class SystemModuleExtensionBase<ExecutorConfig, Ex extends Executor<ExecutorConfig>> {
  readonly instance: Unraid<ExecutorConfig, Ex>;

  constructor(instance: Unraid<ExecutorConfig, Ex>) {
    this.instance = instance;
  }
}
