import { execute } from '../../ssh/SSH';

type IInfoResult = {
  manufacturer: string;
  productName: string;
  version: string;
};

/**
 * Returns current System info like manufacturer, productname and also the version
 */
async function info(): Promise<IInfoResult> {
  const { code, stdout } = await execute("dmidecode | grep -A3 '^System Information'");
  if (code !== 0) throw new Error('Got non-zero exit code while getting system info');
  return {
    manufacturer: stdout[1].replace('\tManufacturer:', '').trim(),
    productName: stdout[2].replace('\tProduct Name:', '').trim(),
    version: stdout[3].replace('\tVersion:', '').trim(),
  };
}

export { info };
