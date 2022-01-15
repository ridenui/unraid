import { Executor } from '../../../instance/executor';
import { UnraidModuleExtensionBase } from '../unraid-module-extension-base';

export interface IScheduleTask {
  script: string;
  frequency: string;
  id: string;
  custom: string;
}

export interface IUserScriptSchedule {
  [key: string]: IScheduleTask;
}

export class UnraidModuleUserScriptsExtension<
  ExecutorConfig,
  Ex extends Executor<ExecutorConfig>
> extends UnraidModuleExtensionBase<ExecutorConfig, Ex> {
  async hasUserScriptsInstalled(): Promise<boolean> {
    const { code } = await this.instance.execute(`ls /boot/config/plugins/user.scripts`);
    return code === 0;
  }

  async getUserScriptSchedule(): Promise<IUserScriptSchedule> {
    const { code, stdout } = await this.instance.execute(`cat /boot/config/plugins/user.scripts/schedule.json`);
    if (code !== 0) throw new Error('Got non-zero exit code while reading userscript schedule');
    return JSON.parse(stdout.join(''));
  }

  async getUserScriptsScript(scriptName: string): Promise<any> {
    console.log(scriptName);
    const scriptNameParts = scriptName.split('/');
    scriptNameParts.pop();
    const fileDirectory = scriptNameParts.join('/');
    const readDescriptionTask = this.instance.execute(`cat ${fileDirectory}/description`);
    const readNameTask = this.instance.execute(`cat ${fileDirectory}/name`);
    const readScriptTask = this.instance.execute(`cat ${fileDirectory}/script`);
    const [description, name, script] = await Promise.all([readDescriptionTask, readNameTask, readScriptTask]);
    return {
      description: description.code === 0 ? description.stdout.join('') : null,
      name: name.code === 0 ? name.stdout.join('') : null,
      script: script.code === 0 ? script.stdout.join('') : null,
    };
  }
}
