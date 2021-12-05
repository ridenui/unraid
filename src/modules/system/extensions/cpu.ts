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

export class SystemModuleCpuExtension<
  ExecutorConfig,
  Ex extends Executor<ExecutorConfig>
> extends SystemModuleExtensionBase<ExecutorConfig, Ex> {
  async usage(): Promise<CPUUsage> {
    const { code, stdout } = await this.instance.execute(`mpstat -P ALL`);
    if (code !== 0) throw new Error('Got non-zero exit code while getting date');

    return SystemModuleCpuExtension.parseCpuUsageOutput(stdout);
  }

  private static parseCpuUsageOutput(input: string[]): CPUUsage {
    const tempUsage: RecursivePartial<CPUUsage> = {
      all: {},
      cores: [],
      raw: [...input],
    };
    input.splice(0, 3);

    for (const line of input) {
      const cleanedLine = line.split(' ').filter((v) => v);
      cleanedLine.splice(0, 1);

      if (cleanedLine[0] === 'PM' || cleanedLine[0] === 'AM') {
        cleanedLine.splice(0, 1);
      }

      const coreUsage: CoreUsage = {
        usr: parseFloat(cleanedLine[1]),
        nice: parseFloat(cleanedLine[2]),
        sys: parseFloat(cleanedLine[3]),
        iowait: parseFloat(cleanedLine[4]),
        irq: parseFloat(cleanedLine[5]),
        soft: parseFloat(cleanedLine[6]),
        steal: parseFloat(cleanedLine[7]),
        guest: parseFloat(cleanedLine[8]),
        gnice: parseFloat(cleanedLine[9]),
        idle: parseFloat(cleanedLine[10]),
      };

      if (cleanedLine[0] === 'all') {
        tempUsage.all = coreUsage;
      } else {
        tempUsage.cores.push({
          ...coreUsage,
          core: tempUsage.cores.length,
        });
      }
    }

    tempUsage.coreCount = tempUsage.cores.length;

    return tempUsage as Required<CPUUsage>;
  }

  on_cpuUsage(listener: (newLoad: CPUUsage) => void, options?: ICpuUsageStreamOption): [() => void] {
    let cancelFunction;

    if (!this.instance.executor.executeStream) {
      throw new Error('Streaming is not supported by this executor');
    }

    const refresh = options?.refresh ?? 1;

    const promise = this.instance.executor
      .executeStream(`while [ 1 ]; do mpstat -P ALL | tr '\n' '|' | xargs -i echo "{}"; sleep ${refresh}; done`)
      .then(([eventEmitter, cancel, exitPromise]) => {
        cancelFunction = () => {
          cancel().finally(() => {
            eventEmitter.removeAllListeners('onNewStdoutLine');
          });
        };
        eventEmitter.addListener('onNewStdoutLine', (line) => {
          const split = line.split('|');
          split.pop();
          listener(SystemModuleCpuExtension.parseCpuUsageOutput(split));
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
