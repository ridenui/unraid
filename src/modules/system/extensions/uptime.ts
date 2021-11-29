import { Executor } from '../../../instance/executor';
import { SystemModuleExtensionBase } from '../system-module-extension-base';

const regex =
  /(.*)\sup\s(\d*)\sdays,\s(\d*):(\d*),\s\s(\d*)\suser,\s\sload average:\s(\d*\.\d*),\s(\d*\.\d*),\s(\d*\.\d*)/gm;

export type IUptime = {
  raw: string;
  currentTime: number;
  upDays: number;
  upHours: number;
  upMinutes: number;
  users: number;
  loadAverages: {
    1: number;
    5: number;
    15: number;
  };
};

export class SystemModuleUptimeExtension<
  ExecutorConfig,
  Ex extends Executor<ExecutorConfig>
> extends SystemModuleExtensionBase<ExecutorConfig, Ex> {
  async uptime(): Promise<IUptime> {
    const { code, stdout } = await this.instance.execute('uptime');
    if (code !== 0) throw new Error('Got non-zero exit code while getting  uptime');
    // TODO: THIS IS BROKEN
    const [input, time, days, hours, minutes, users, load1min, load5min, load15min] = regex.exec(stdout[0]);
    return {
      raw: input,
      currentTime: parseInt(time, 10),
      upDays: parseInt(days, 10),
      upHours: parseInt(hours, 10),
      upMinutes: parseInt(minutes, 10),
      users: parseInt(users, 10),
      loadAverages: {
        1: parseFloat(load1min),
        5: parseFloat(load5min),
        15: parseFloat(load15min),
      },
    };
  }
}
