import { listUserscripts } from '../../../bash-scripts';
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

export interface Schedule {
    script: string;
    frequency: string;
    id: string;
    custom: string;
}

export interface UserScriptJSON {
    name: string;
    dirName: string;
    running: boolean;
    script: string;
    description?: string;
    schedule: Schedule | null;
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

    async getUserScripts(): Promise<UserScript[]> {
        const { stdout, code } = await this.instance.execute(listUserscripts());

        if (code !== 0) throw new Error('Got non-zero exit code while reading userscripts');

        const parsedUserScripts: UserScriptJSON[] = JSON.parse(stdout.join('\n'));

        return parsedUserScripts.map((userScriptInfo) => {
            return new UserScript(this.instance, userScriptInfo);
        });
    }
}
