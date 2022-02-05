import { UnraidModuleExtensionBase } from '../unraid-module-extension-base';
import { UserScript } from './userscripts/user-script';

export interface IScheduleTask {
  script: string;
  frequency: string;
  id: string;
  custom: string;
}

export interface IUserScriptSchedule {
  [key: string]: IScheduleTask;
}

export interface IUserScript {
  script: string | null;
  description: string | null;
  name: string | null;
}

export class UnraidModuleUserScriptsExtension extends UnraidModuleExtensionBase {
  async hasUserScriptsInstalled(): Promise<boolean> {
    const { code } = await this.instance.execute(`test -f /boot/config/plugins/user.scripts.plg`);
    return code === 0;
  }

  async getUserScriptSchedule(): Promise<IUserScriptSchedule> {
    const { code, stdout } = await this.instance.execute(`cat /boot/config/plugins/user.scripts/schedule.json`);
    if (code !== 0) throw new Error('Got non-zero exit code while reading userscript schedule');
    return JSON.parse(stdout.join(''));
  }

  async getUserScripts(prePopulate = false): Promise<UserScript[]> {
    const schedule = await this.getUserScriptSchedule();

    const tasks = Object.keys(schedule).map((task) => {
      const scriptLocation = schedule[task].script;
      const scriptInstance = new UserScript(this.instance, schedule[task].id, scriptLocation, schedule[task].frequency);
      return prePopulate
        ? (async () => {
            await scriptInstance.prePopulateCache();
            return scriptInstance;
          })()
        : scriptInstance;
    });

    return Promise.all(tasks);
  }
}
