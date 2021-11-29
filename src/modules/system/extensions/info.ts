import { Executor } from '../../../instance/executor';
import { SystemModuleExtensionBase } from '../system-module-extension-base';

export type IInfoResult = {
  manufacturer: string;
  productName: string;
  version: string;
};

export class SystemModuleInfoExtension<
  ExecutorConfig,
  Ex extends Executor<ExecutorConfig>
> extends SystemModuleExtensionBase<ExecutorConfig, Ex> {
  /**
   * Returns current System info like manufacturer, productname and also the version
   */
  async info(): Promise<IInfoResult> {
    const { code, stdout } = await this.instance.execute("dmidecode | grep -A3 '^System Information'");
    if (code !== 0) throw new Error('Got non-zero exit code while getting system info');
    return {
      manufacturer: stdout[1].replace('\tManufacturer:', '').trim(),
      productName: stdout[2].replace('\tProduct Name:', '').trim(),
      version: stdout[3].replace('\tVersion:', '').trim(),
    };
  }
}
