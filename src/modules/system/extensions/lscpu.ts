import { SystemModuleExtensionBase } from '../system-module-extension-base';

export type ILscpuResult = Record<string, string>;

function convertFieldsToKeys(fields: Record<string, string>[]): Record<string, string> {
    const result = {};
    fields.forEach((field) => {
        const prettyFieldName = field.field.replace(/\(|\)|:| /g, '');
        result[prettyFieldName] = field.data;
    });
    return result;
}

export class SystemModuleLscpuExtension extends SystemModuleExtensionBase {
    /**
     * Get Processor Information
     */
    async lscpu(): Promise<ILscpuResult> {
        const { code, stdout } = await this.instance.execute('lscpu -J');
        if (code !== 0) throw new Error('Got non-zero exit code while getting cpu information');
        const resultAsJson = JSON.parse(stdout.join(''));

        return convertFieldsToKeys(resultAsJson.lscpu);
    }
}
