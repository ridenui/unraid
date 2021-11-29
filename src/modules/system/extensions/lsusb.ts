import { Executor } from '../../../instance/executor';
import { SystemModuleExtensionBase } from '../system-module-extension-base';

const regex = /Bus\s(\d*)\sDevice\s(\d*): ID\s(.*):(\d*)\s(.*)/g;

export type ILsusbResult = {
  raw: string;
  busNum: string;
  deviceId: string;
  vendorId: string;
  productId: string;
  productName: string;
};

export class SystemModuleLsusbExtension<
  ExecutorConfig,
  Ex extends Executor<ExecutorConfig>
> extends SystemModuleExtensionBase<ExecutorConfig, Ex> {
  /**
   * List all usb devices
   * @example Get usb devices
   * ```ts
   * await lsusb();
   * ```
   */
  // TODO: THIS IS BROKEN
  async lsusb(): Promise<ILsusbResult[]> {
    const { code, stdout } = await this.instance.execute('lsusb');
    if (code !== 0) throw new Error('Got non-zero exit code while listing usb devices');
    const result = [];
    stdout.forEach((usbDevice) => {
      regex.lastIndex = 0;
      const [input, busNum, deviceId, vendorId, productId, productName] = regex.exec(usbDevice);
      result.push({
        raw: input,
        busNum,
        deviceId,
        vendorId,
        productId,
        productName,
      });
    });
    return result;
  }
}
