import { SystemModuleExtensionBase } from '../system-module-extension-base';

export class SystemModuleHostnameExtension extends SystemModuleExtensionBase {
    async getHostname(): Promise<string> {
        const { code, stdout } = await this.instance.execute('hostname');
        if (code !== 0) throw new Error('Got non-zero exit code while getting hostname');
        return stdout.join('');
    }
}
