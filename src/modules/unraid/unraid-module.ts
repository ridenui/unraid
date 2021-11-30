import { mix } from 'ts-mixer';
import { Executor } from '../../instance/executor';
import { Unraid } from '../../instance/unraid';
import { UnraidModuleCaseModelExtension } from './extensions';

// required for mixins
export interface UnraidModule<ExecutorConfig, Ex extends Executor<ExecutorConfig>>
  extends UnraidModuleCaseModelExtension<ExecutorConfig, Ex> {
  instance: Unraid<ExecutorConfig, Ex>;
}

@mix(UnraidModuleCaseModelExtension)
export class UnraidModule<ExecutorConfig, Ex extends Executor<ExecutorConfig>> {
  instance: Unraid<ExecutorConfig, Ex>;

  constructor(instance: Unraid<ExecutorConfig, Ex>) {
    this.instance = instance;
  }
}
