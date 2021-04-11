import { execute } from '../../ssh/SSH';

const regex = /Bus\s(\d*)\sDevice\s(\d*): ID\s(.*):(\d*)\s(.*)/g;

type ILsusbResult = {
  raw: string;
  busNum: string;
  deviceId: string;
  vendorId: string;
  productId: string;
  productName: string;
};

/**
 * List all usb devices
 * @example Get usb devices
 * ```ts
 * await lsusb();
 * ```
 */
async function lsusb(): Promise<ILsusbResult[]> {
  const { code, stdout } = await execute('lsusb');
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

export { lsusb };
