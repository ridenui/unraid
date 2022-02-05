import { mix } from 'ts-mixer';
import { Unraid } from '../../instance/unraid';
import {
  UnraidModuleCaseModelExtension,
  UnraidModuleIdentConfigExtension,
  UnraidModuleNotificationExtension,
  UnraidModuleUserScriptsExtension,
} from './extensions';

// required for mixins
export interface UnraidModule
  extends UnraidModuleNotificationExtension,
    UnraidModuleIdentConfigExtension,
    UnraidModuleUserScriptsExtension,
    UnraidModuleCaseModelExtension {
  /**
   * @private
   */
  instance: Unraid;
}

@mix(
  UnraidModuleCaseModelExtension,
  UnraidModuleNotificationExtension,
  UnraidModuleIdentConfigExtension,
  UnraidModuleUserScriptsExtension
)
export class UnraidModule {
  instance: Unraid;

  constructor(instance: Unraid) {
    this.instance = instance;
  }
}
