import { mix } from 'ts-mixer';
import { Executor } from '../../instance/executor';
import { Unraid } from '../../instance/unraid';
import { UnraidModuleCaseModelExtension, UnraidModuleNotificationExtension } from './extensions';

// required for mixins
export interface UnraidModule<ExecutorConfig, Ex extends Executor<ExecutorConfig>>
  extends UnraidModuleNotificationExtension<ExecutorConfig, Ex>,
    UnraidModuleCaseModelExtension<ExecutorConfig, Ex> {
  instance: Unraid<ExecutorConfig, Ex>;
}

@mix(UnraidModuleCaseModelExtension, UnraidModuleNotificationExtension)
export class UnraidModule<ExecutorConfig, Ex extends Executor<ExecutorConfig>> {
  instance: Unraid<ExecutorConfig, Ex>;

  constructor(instance: Unraid<ExecutorConfig, Ex>) {
    this.instance = instance;
  }
}
