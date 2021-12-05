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

export type ILoadAverageStreamOption = {
  /**
   * Refresh time in seconds
   */
  refresh?: number;
};

export class SystemModuleLoadAverageExtension<
  ExecutorConfig,
  Ex extends Executor<ExecutorConfig>
> extends SystemModuleExtensionBase<ExecutorConfig, Ex> {
  async loadAverage(): Promise<ILoadAverage> {
    const { code, stdout } = await this.instance.execute('cat /proc/loadavg');
    if (code !== 0) throw new Error('Got non-zero exit code while getting loadaverage');

    return SystemModuleLoadAverageExtension.parseLoadAverage(stdout[0]);
  }

  private static parseLoadAverage(input: string): ILoadAverage {
    const [one, five, fifteen, kseInfo, lastPid] = input.split(' ');
    const [currentlyExecuted, existing] = kseInfo.split('/');

    return {
      raw: input,
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

  on_loadAverage(listener: (newLoad: ILoadAverage) => void, options?: ILoadAverageStreamOption): [() => void] {
    let cancelFunction;

    if (!this.instance.executor.executeStream) {
      throw new Error('Streaming is not supported by this executor');
    }

    const refresh = options?.refresh ?? 1;

    const promise = this.instance.executor
      .executeStream(`while [ 1 ]; do cat /proc/loadavg; sleep ${refresh}; done`)
      .then(([eventEmitter, cancel, exitPromise]) => {
        cancelFunction = () => {
          cancel().finally(() => {
            eventEmitter.removeAllListeners('onNewStdoutLine');
          });
        };
        eventEmitter.addListener('onNewStdoutLine', (line) => {
          listener(SystemModuleLoadAverageExtension.parseLoadAverage(line));
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
