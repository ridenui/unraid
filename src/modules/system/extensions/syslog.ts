import { SystemModuleExtensionBase } from '../system-module-extension-base';

export type ISyslog = {
  lines?: number;
};

export class SystemModuleSyslogExtension extends SystemModuleExtensionBase {
  async syslog({ lines }: ISyslog = {}): Promise<string[]> {
    const { code, stdout } = await this.instance.execute(`tail ${lines ? `--lines ${lines}` : ''} /var/log/syslog`);
    if (code !== 0) throw new Error('Got non-zero exit code while reading syslog');
    return stdout;
  }

  on_syslog(listener: (newLine: string) => void): [() => void] {
    let cancelFunction;

    if (!this.instance.executor.executeStream) {
      throw new Error('Streaming is not supported by this executor');
    }

    const promise = this.instance.executor
      .executeStream('tail -n -0 -f /var/log/syslog')
      .then(([eventEmitter, cancel, exitPromise]) => {
        cancelFunction = () => {
          cancel().finally(() => {
            eventEmitter.removeAllListeners('onNewStdoutLine');
          });
        };
        eventEmitter.addListener('onNewStdoutLine', (line) => {
          listener(line);
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
