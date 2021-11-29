import { Executor } from '../../../instance/executor';
import { SystemModuleExtensionBase } from '../system-module-extension-base';

export type ISyslog = {
  lines?: number;
};

export class SystemModuleSyslogExtension<
  ExecutorConfig,
  Ex extends Executor<ExecutorConfig>
> extends SystemModuleExtensionBase<ExecutorConfig, Ex> {
  async syslog({ lines }: ISyslog = {}): Promise<string[]> {
    const { code, stdout } = await this.instance.execute(`tail ${lines ? `--lines ${lines}` : ''} /var/log/syslog`);
    if (code !== 0) throw new Error('Got non-zero exit code while reading syslog');
    return stdout;
  }
}
