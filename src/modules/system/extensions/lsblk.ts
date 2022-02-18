import { SystemModuleExtensionBase } from '../system-module-extension-base';

export type ILsblk = {
    all?: boolean;
};

export class SystemModuleLsblkExtension extends SystemModuleExtensionBase {
    /**
     * List all block devices
     * @param all - toggles `--all` flag in `lsblk`
     * @example Get basic information
     * ```ts
     * await lsblk();
     * await lsblk({all: false});
     * ```
     *
     * @example Get all information
     * ```ts
     * await lsblk({all: true});
     * ```
     */
    async lsblk({ all = false }: ILsblk = {}): Promise<Record<never, never>> {
        const { code, stdout } = await this.instance.execute(`lsblk -J ${all ? '--all' : ''}`);
        if (code !== 0) throw new Error('Got non-zero exit code while listing block devices');
        return JSON.parse(stdout.join(''));
    }
}
