import { UnraidModuleExtensionBase } from '../unraid-module-extension-base';

export class UnraidModuleCaseModelExtension extends UnraidModuleExtensionBase {
  async getCaseModel(): Promise<string> {
    const { code, stdout } = await this.instance.execute(`cat /boot/config/plugins/dynamix/case-model.cfg`);
    if (code !== 0) throw new Error('Got non-zero exit code while getting case-model');

    return stdout.join('');
  }

  async setCaseModel(caseModel: string): Promise<void> {
    const { code } = await this.instance.execute(`echo ${caseModel} > /boot/config/plugins/dynamix/case-model.cfg`);
    if (code !== 0) throw new Error('Got non-zero exit code while writing case-model');
  }
}
