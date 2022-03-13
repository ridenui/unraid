import { isUserScriptRunningScript } from '../../../../bash-scripts';
import { Unraid } from '../../../../instance/unraid';
import { Schedule, UserScriptJSON } from '../userscripts';

export class UserScript {
    private readonly instance: Unraid;

    private runningCache: boolean;

    public readonly name: string;

    public readonly dirName: string;

    public readonly script: string;

    public readonly description?: string;

    public readonly schedule?: Schedule;

    constructor(instance: Unraid, userScriptJson: UserScriptJSON) {
        this.name = userScriptJson.name;
        this.dirName = userScriptJson.dirName;
        this.runningCache = userScriptJson.running;
        this.script = userScriptJson.script;
        this.description = userScriptJson.description;
        if (userScriptJson.schedule) {
            this.schedule = userScriptJson.schedule;
        }
    }

    async running(byPassCache?: boolean): Promise<boolean> {
        if (this.runningCache && !byPassCache) {
            return this.runningCache;
        }
        const { code } = await this.instance.execute(isUserScriptRunningScript(this.dirName));
        if (code !== 0 && code !== 13) {
            throw new Error('Got non-zero exit code while reading running state of userscript');
        }
        let running = false;
        if (code === 0) running = true;
        this.runningCache = running;
        return this.runningCache;
    }
}
