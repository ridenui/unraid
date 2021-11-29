import { mix } from 'ts-mixer';
import { Executor } from '../../instance/executor';
import { Unraid } from '../../instance/unraid';
import {
  SystemModuleDateExtension,
  SystemModuleDiskfree,
  SystemModuleInfoExtension,
  SystemModuleLsblkExtension,
  SystemModuleLsusbExtension,
  SystemModuleNtpExtension,
  SystemModuleSmartctlExtension,
  SystemModuleSyslogExtension,
  SystemModuleUptimeExtension,
  SystemModuleUsersExtension,
} from './extensions';

// required for mixins
export interface SystemModule<ExecutorConfig, Ex extends Executor<ExecutorConfig>>
  extends SystemModuleDateExtension<ExecutorConfig, Ex>,
    SystemModuleDiskfree<ExecutorConfig, Ex>,
    SystemModuleInfoExtension<ExecutorConfig, Ex>,
    SystemModuleLsblkExtension<ExecutorConfig, Ex>,
    SystemModuleLsusbExtension<ExecutorConfig, Ex>,
    SystemModuleNtpExtension<ExecutorConfig, Ex>,
    SystemModuleSmartctlExtension<ExecutorConfig, Ex>,
    SystemModuleSyslogExtension<ExecutorConfig, Ex>,
    SystemModuleUptimeExtension<ExecutorConfig, Ex>,
    SystemModuleUsersExtension<ExecutorConfig, Ex> {
  instance: Unraid<ExecutorConfig, Ex>;
}

@mix(
  SystemModuleDateExtension,
  SystemModuleDiskfree,
  SystemModuleInfoExtension,
  SystemModuleLsblkExtension,
  SystemModuleLsusbExtension,
  SystemModuleNtpExtension,
  SystemModuleSmartctlExtension,
  SystemModuleSyslogExtension,
  SystemModuleUptimeExtension,
  SystemModuleUsersExtension
)
export class SystemModule<ExecutorConfig, Ex extends Executor<ExecutorConfig>> {
  instance: Unraid<ExecutorConfig, Ex>;

  constructor(instance: Unraid<ExecutorConfig, Ex>) {
    this.instance = instance;
  }
}
