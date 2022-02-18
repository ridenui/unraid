import { SystemModuleExtensionBase } from '../system-module-extension-base';

export class SystemModuleNtpExtension extends SystemModuleExtensionBase {
    async ntp(): Promise<string[]> {
        const { code, stdout } = await this.instance.execute('cat /etc/ntp.conf | grep server');
        if (code !== 0) throw new Error('Got non-zero exit code while listing ntpservers');
        const result = [];
        stdout.forEach((fileLine) => {
            if (fileLine.startsWith('#')) return;
            // Skip local clock
            if (fileLine.includes('127.127.1.0')) return;
            const serverHost = fileLine.replace('server', '').trim().split(' ')[0];
            result.push(serverHost);
        });
        return result;
    }
}
