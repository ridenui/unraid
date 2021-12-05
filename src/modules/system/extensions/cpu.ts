import { Executor } from '../../../instance/executor';
import type { RecursivePartial } from '../../../util/type';
import { SystemModuleExtensionBase } from '../system-module-extension-base';

export interface CoreUsage {
  usr: number;
  nice: number;
  sys: number;
  iowait: number;
  irq: number;
  soft: number;
  steal: number;
  guest: number;
  gnice: number;
  idle: number;
}

export interface CPUUsage {
  coreCount: number;
  all: CoreUsage;
  cores: (CoreUsage & { core: number })[];
  raw: string[];
}

export type ICpuUsageStreamOption = {
  /**
   * Refresh time in seconds
   */
  refresh?: number;
};

interface CPULoad {
  cpu?: string;
  usr?: number;
  nice?: number;
  sys?: number;
  iowait?: number;
  irq?: number;
  soft?: number;
  steal?: number;
  guest?: number;
  gnice?: number;
  idle?: number;
}

interface Statistic {
  timestamp?: string;
  'cpu-load'?: CPULoad[];
}

interface Host {
  nodename?: string;
  sysname?: string;
  release?: string;
  machine?: string;
  'number-of-cpus'?: number;
  date?: string;
  statistics?: Statistic[];
}

interface Sysstat {
  hosts?: Host[];
}

interface MPStat {
  sysstat?: Sysstat;
}

export class SystemModuleCpuExtension<
  ExecutorConfig,
  Ex extends Executor<ExecutorConfig>
> extends SystemModuleExtensionBase<ExecutorConfig, Ex> {
  async usage(): Promise<CPUUsage> {
    const { code, stdout } = await this.instance.execute(`mpstat -P ALL 1 1 -o JSON`);
    if (code !== 0) throw new Error('Got non-zero exit code while getting date');

    return SystemModuleCpuExtension.parseCpuUsageOutput(stdout);
  }

  private static parseCpuUsageOutput(input: string[]): CPUUsage {
    const tempUsage: RecursivePartial<CPUUsage> = {
      all: {},
      cores: [],
      raw: [...input],
    };

    try {
      const parsedJson: MPStat = JSON.parse(input.join(''));

      const load = parsedJson.sysstat.hosts[0].statistics[0]['cpu-load'];

      for (const { cpu, ...coreLoad } of load) {
        if (cpu === 'all') {
          tempUsage.all = {
            ...coreLoad,
          };
        } else {
          tempUsage.cores.push({
            core: tempUsage.cores.length,
            ...coreLoad,
          });
        }
      }

      tempUsage.coreCount = tempUsage.cores.length;

      return tempUsage as Required<CPUUsage>;
    } catch (e) {
      throw new Error('Failed to parse mpstat output');
    }
  }

  on_cpuUsage(listener: (newLoad: CPUUsage) => void, options?: ICpuUsageStreamOption): [() => void] {
    let cancelFunction;

    if (!this.instance.executor.executeStream) {
      throw new Error('Streaming is not supported by this executor');
    }

    const refresh = options?.refresh ?? 1;

    const promise = this.instance.executor
      .executeStream(`while [ 1 ]; do mpstat -P ALL 1 1 -o JSON | tr '\n' ' ' | xargs -0 echo; sleep ${refresh}; done`)
      .then(([eventEmitter, cancel, exitPromise]) => {
        cancelFunction = () => {
          cancel().finally(() => {
            eventEmitter.removeAllListeners('onNewStdoutLine');
          });
        };
        eventEmitter.addListener('onNewStdoutLine', (line) => {
          listener(SystemModuleCpuExtension.parseCpuUsageOutput([line]));
        });
        exitPromise.finally(() => {
          eventEmitter.removeAllListeners('onNewStdoutLine');
        });
      });

    return [
      () => {
        promise.finally(() => {
          if (cancelFunction) {
            cancelFunction();
          }
        });
      },
    ];
  }
}
