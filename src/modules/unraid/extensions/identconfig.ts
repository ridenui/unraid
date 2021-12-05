import { Executor } from '../../../instance/executor';
import { UnraidModuleExtensionBase } from '../unraid-module-extension-base';

export type IdentConfig = {
  name: string;
  timezone: string;
  comment: string;
  security: string;
  workgroup: string;
  domain: string;
  domainShort: string;
  hidedotfiles: string;
  localmaster: string;
  enablefruit: string;
  useNetbios: string;
  useWsd: string;
  wsdOpt: string;
  useNtp: string;
  ntpServer1: string;
  ntpServer2: string;
  ntpServer3: string;
  ntpServer4: string;
  domainLogin: string;
  domainPasswd: string;
  sysModel: string;
  sysArraySlots: string;
  useSsl: string;
  port: string;
  portssl: string;
  localTld: string;
  bindMgt: string;
  useTelnet: string;
  porttelnet: string;
  useSsh: string;
  portssh: string;
  useUpnp: string;
  startPage: string;
  [key: string]: string;
};

function snakeToCamel(input: string): string {
  const keys = input.split('_');
  const partsWithUpperCase = keys.map((key, index) => {
    if (index === 0) return key;
    return key.charAt(0).toUpperCase() + key.slice(1);
  });
  return partsWithUpperCase.join('');
}

export class UnraidModuleIdentConfigExtension<
  ExecutorConfig,
  Ex extends Executor<ExecutorConfig>
> extends UnraidModuleExtensionBase<ExecutorConfig, Ex> {
  /**
   * Returns /boot/config/ident.cfg as parsed JSON
   */
  async getIdentConfig(): Promise<IdentConfig> {
    const { code, stdout } = await this.instance.execute(`cat /boot/config/ident.cfg`);
    if (code !== 0) throw new Error('Got non-zero exit code while catting ident.cfg');
    const result = {};
    stdout.forEach((line) => {
      if (line.startsWith('#')) return;
      const [key, value] = line.split('=');
      const cameledKey = snakeToCamel(key.toLowerCase());
      result[cameledKey] = value.replace('\r', '').replace(/"/g, '');
    });

    return result as IdentConfig;
  }
}
