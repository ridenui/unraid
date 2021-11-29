import { Executor } from '../../../instance/executor';
import { SystemModuleExtensionBase } from '../system-module-extension-base';

export interface IDiskFreeReturn {
  fs: string;
  blocks: number;
  used: number;
  available: number;
  mounted: string;
}

export class SystemModuleDiskfree<
  ExecutorConfig,
  Ex extends Executor<ExecutorConfig>
> extends SystemModuleExtensionBase<ExecutorConfig, Ex> {
  /**
   * Returns the current disk free stats
   */
  async diskfree(): Promise<IDiskFreeReturn[]> {
    const { code, stdout } = await this.instance.execute('df');
    if (code !== 0) throw new Error('Got non-zero exit code while running df');

    stdout.shift();

    return stdout.map((line) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [fs, blocks, used, available, _, mounted] = line.split(' ').filter((v) => v);
      return {
        fs,
        blocks: parseInt(blocks, 10),
        used: parseInt(used, 10),
        available: parseInt(available, 10),
        mounted,
      };
    });
  }
}
