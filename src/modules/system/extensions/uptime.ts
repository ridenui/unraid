import { Executor } from '../../../instance/executor';
import { SystemModuleExtensionBase } from '../system-module-extension-base';

export type IUptime = {
  raw: string;
  upSince: Date;
};

export class SystemModuleUptimeExtension<
  ExecutorConfig,
  Ex extends Executor<ExecutorConfig>
> extends SystemModuleExtensionBase<ExecutorConfig, Ex> {
  async uptime(): Promise<IUptime> {
    const { code, stdout } = await this.instance.execute('uptime -s');
    if (code !== 0) throw new Error('Got non-zero exit code while getting  uptime');
    return {
      raw: stdout[0],
      upSince: new Date(stdout[0]),
    };
  }
}
