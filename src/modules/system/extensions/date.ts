import { Executor } from '../../../instance/executor';
import { SystemModuleExtensionBase } from '../system-module-extension-base';

export class SystemModuleDateExtension<
  ExecutorConfig,
  Ex extends Executor<ExecutorConfig>
> extends SystemModuleExtensionBase<ExecutorConfig, Ex> {
  async date(parsed?: false): Promise<string>;

  async date(parsed?: true): Promise<Date>;

  async date(parsed?: boolean): Promise<string | Date> {
    const { code, stdout } = await this.instance.execute(`date${parsed ? ' -R' : ''}`);
    if (code !== 0) throw new Error('Got non-zero exit code while getting date');
    if (parsed) {
      return new Date(stdout.join(''));
    }
    return stdout.join('');
  }
}
