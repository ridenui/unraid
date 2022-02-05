import { mix } from 'ts-mixer';
import { Unraid } from '../../instance/unraid';
import { EventExtension } from '../extension/event-extension';
import { CPUUsage, ICpuUsageStreamOption, SystemModuleCpuExtension } from './extensions/cpu';
import type { ILoadAverage, ILoadAverageStreamOption } from './extensions';
import {
  SystemModuleDateExtension,
  SystemModuleDiskfree,
  SystemModuleHostnameExtension,
  SystemModuleInfoExtension,
  SystemModuleLoadAverageExtension,
  SystemModuleLsblkExtension,
  SystemModuleLscpuExtension,
  SystemModuleLsusbExtension,
  SystemModuleNtpExtension,
  SystemModuleSmartctlExtension,
  SystemModuleSyslogExtension,
  SystemModuleUptimeExtension,
  SystemModuleUsersExtension,
} from './extensions';

// required for mixins
export interface SystemModule
  extends EventExtension<{
      syslog: { handlerType: string };
      loadAverage: { handlerType: ILoadAverage; optionType: ILoadAverageStreamOption };
      cpuUsage: { handlerType: CPUUsage; options: ICpuUsageStreamOption };
    }>,
    SystemModuleDateExtension,
    SystemModuleDiskfree,
    SystemModuleHostnameExtension,
    SystemModuleInfoExtension,
    SystemModuleLoadAverageExtension,
    SystemModuleLsblkExtension,
    SystemModuleLscpuExtension,
    SystemModuleLsusbExtension,
    SystemModuleNtpExtension,
    SystemModuleSmartctlExtension,
    SystemModuleSyslogExtension,
    SystemModuleUptimeExtension,
    SystemModuleCpuExtension,
    SystemModuleUsersExtension {
  /**
   * @private
   */
  instance: Unraid;
}

@mix(
  EventExtension,
  SystemModuleDateExtension,
  SystemModuleDiskfree,
  SystemModuleHostnameExtension,
  SystemModuleInfoExtension,
  SystemModuleLoadAverageExtension,
  SystemModuleLsblkExtension,
  SystemModuleLscpuExtension,
  SystemModuleLsusbExtension,
  SystemModuleNtpExtension,
  SystemModuleSmartctlExtension,
  SystemModuleSyslogExtension,
  SystemModuleUptimeExtension,
  SystemModuleUsersExtension,
  SystemModuleCpuExtension
)
export class SystemModule {
  instance: Unraid;

  constructor(instance: Unraid) {
    this.instance = instance;
  }
}
