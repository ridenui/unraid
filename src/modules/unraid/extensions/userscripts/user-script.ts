import { EventEmitter } from 'events';
import {
    abortUserScript,
    convertUserScript,
    isUserScriptRunningScript,
    runConvertedUserScript,
    runForegroundUserScript,
} from '../../../../bash-scripts';
import { CancelFunction, IExecuteStreamResult } from '../../../../instance/executor';
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

    public readonly foregroundOnly: boolean = false;

    public readonly backgroundOnly: boolean = false;

    // TODO: actually check if array is started
    public readonly arrayStarted: boolean = false;

    // TODO: actually clear log
    public readonly clearLog: boolean = false;

    public readonly noParity: boolean = false;

    public readonly argumentDescription?: string;

    public readonly argumentDefault?: string;

    public readonly interpreter: string = '/bin/bash';

    constructor(instance: Unraid, userScriptJson: UserScriptJSON) {
        this.instance = instance;
        this.name = userScriptJson.name;
        this.dirName = userScriptJson.dirName;
        this.runningCache = userScriptJson.running;
        this.script = userScriptJson.script;
        this.description = userScriptJson.description;
        if (userScriptJson.schedule) {
            this.schedule = userScriptJson.schedule;
        }
        if (!this.script) return;
        for (const line of this.script.split('\n')) {
            if (line.startsWith('#!')) {
                this.interpreter = line.slice(2);
                continue;
            }
            if (/#.+=.+$/gm.test(line)) {
                const keyValuePar = line.slice(1);
                const [key, value] = keyValuePar.split('=');
                switch (key) {
                    case 'description':
                        this.description = value;
                        break;
                    case 'name':
                        this.name = value;
                        break;
                    case 'argumentDescription':
                        this.argumentDescription = value;
                        break;
                    case 'argumentDefault':
                        this.argumentDefault = value;
                        break;
                    case 'foregroundOnly':
                        this.foregroundOnly = value.includes('true');
                        break;
                    case 'backgroundOnly':
                        this.backgroundOnly = value.includes('true');
                        break;
                    case 'arrayStarted':
                        this.arrayStarted = value.includes('true');
                        break;
                    case 'clearLog':
                        this.clearLog = value.includes('true');
                        break;
                    case 'noParity':
                        this.noParity = value.includes('true');
                        break;
                }
            } else {
                // Stop parsing after first non comment line like the userscript plugin
                break;
            }
        }
    }

    /**
     * Check if this userscript is running in the background
     * @param byPassCache
     */
    async running(byPassCache?: boolean): Promise<boolean> {
        if (this.foregroundOnly) return false;
        if (this.runningCache && !byPassCache) {
            return this.runningCache;
        }
        const { code, stdout } = await this.instance.execute(isUserScriptRunningScript(this.dirName));
        if (code !== 0) throw new Error('Got non-zero exit code while reading running state of userscript');
        const response = stdout.join('').trim();
        this.runningCache = response.includes('true');
        return this.runningCache;
    }

    /**
     * Starts userscript in background mode
     */
    async startBackground() {
        if (this.foregroundOnly) throw new Error("This userscript doesn't support background execution");
        const isRunning = await this.running(true);
        if (isRunning) return;
        const { code, stdout } = await this.instance.execute(
            convertUserScript(`/boot/config/plugins/user.scripts/scripts/${this.dirName}/script`)
        );
        if (code !== 0) throw new Error(`Got non-zero (${code}) exit code while converting the userscript`);
        const tempPath = stdout.join('').trim();
        if (!tempPath) throw new Error('Failed to convert userscript');
        const { code: runCode } = await this.instance.execute(runConvertedUserScript(tempPath));
        if (runCode !== 0) throw new Error('Failed to run converted userscript');
        await this.running(true);
    }

    /**
     * Aborts this userscript if it is running in background
     */
    async abort() {
        const isRunning = await this.running(true);
        if (!isRunning) return;
        const { code } = await this.instance.execute(abortUserScript(this.dirName));
        if (code !== 0) throw new Error(`Failed to abort userscript`);
        await this.running(true);
    }

    /**
     * Start the userscript in foreground mode
     * @param inputParameterCallback This callback gets called if an argument for the script is required
     */
    async start(
        inputParameterCallback?: (description: string, defaultValue?: string) => Promise<string>
    ): Promise<[EventEmitter, CancelFunction, Promise<IExecuteStreamResult>]> {
        if (!this.instance.executor.executeStream)
            throw new Error("This unraid executor doesn't support streaming execution");
        if (this.backgroundOnly) throw new Error("This userscript doesn't support forground execution");
        const isRunning = await this.running(true);
        if (isRunning) throw new Error('Userscript is already running in background');
        if (this.argumentDescription && this.argumentDefault && !inputParameterCallback) {
            inputParameterCallback = async () => this.argumentDefault;
        }
        if (this.argumentDescription && !inputParameterCallback)
            throw new Error('Missing input callback for userscript');
        const argument = this.argumentDescription
            ? await inputParameterCallback(this.argumentDescription, this.argumentDefault)
            : null;
        const script = `${this.interpreter} /boot/config/plugins/user.scripts/scripts/${this.dirName}/script`;
        return this.instance.executor.executeStream(
            runForegroundUserScript(argument ? `${script} ${argument}` : script)
        );
    }
}
