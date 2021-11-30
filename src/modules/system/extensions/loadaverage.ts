import { Executor } from '../../../instance/executor';
import { SystemModuleExtensionBase } from '../system-module-extension-base';

export type ILoadAverage = {
  raw: string;
  loadAverage: {
    '1': number;
    '5': number;
    '15': number;
  };
  lastPid: number;
  kernelSchedulingEntities: {
    currentlyExecuted: number;
    existing: number;
  };
};

export class SystemModuleLoadAverageExtension<
  ExecutorConfig,
  Ex extends Executor<ExecutorConfig>
> extends SystemModuleExtensionBase<ExecutorConfig, Ex> {
  async loadAverage(): Promise<ILoadAverage> {
    const { code, stdout } = await this.instance.execute('cat /proc/loadavg');
    if (code !== 0) throw new Error('Got non-zero exit code while getting loadaverage');

    const [one, five, fifteen, kseInfo, lastPid] = stdout[0].split(' ');
    const [currentlyExecuted, existing] = kseInfo.split('/');

    return {
      raw: stdout[0],
      lastPid: parseInt(lastPid, 10),
      loadAverage: {
        '1': parseInt(one, 10),
        '5': parseInt(five, 10),
        '15': parseInt(fifteen, 10),
      },
      kernelSchedulingEntities: {
        currentlyExecuted: parseInt(currentlyExecuted, 10),
        existing: parseInt(existing, 10),
      },
    };
  }
}
