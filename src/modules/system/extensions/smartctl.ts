import { SystemModuleExtensionBase } from '../system-module-extension-base';

type ISmartctl = {
  deviceName: string;
  all: boolean;
};

export class SystemModuleSmartctlExtension extends SystemModuleExtensionBase {
  /**
   * List smart information for specified device
   * @example Get information for device /dev/sda1
   * ```ts
   * await smartctl({deviceName: '/dev/sda1', all: true});
   * ```
   * @param __namedParameters Set device name and toggle all flag
   * @param __namedParameters.deviceName Set device name
   * @param __namedParameters.all Toggle --all and --xall Arguments for smartctl
   */
  async smartctl({ deviceName, all }: ISmartctl): Promise<Record<never, never>> {
    // Error Code check is disabled here as smartctl returns some non-zero exit codes
    const { stdout } = await this.instance.execute(`smartctl -j ${all ? '--all --xall ' : ''}${deviceName}`);
    return JSON.parse(stdout.join(''));
  }
}
