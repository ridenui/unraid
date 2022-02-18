import type { Union } from 'ts-toolbelt';
import { isUserScriptRunningScript } from '../../../../bash-scripts';
import { Unraid } from '../../../../instance/unraid';

type CacheState<Value> = {
    cached: boolean;
    value?: Value;
};

type CachedProperties =
    | { name: 'description'; value: string }
    | { name: 'name'; value: string }
    | { name: 'script'; value: string }
    | { name: 'running'; value: boolean };

type CacheDictionary<Keys extends string = CachedProperties['name']> = {
    [key in Keys]: CacheState<Union.Select<CachedProperties, { name: key }>['value']>;
};

export class UserScript {
    private readonly instance: Unraid;

    public readonly id: string;

    public readonly scriptLocation: string;

    public readonly frequency: string;

    private readonly scriptDirectory: string;

    private cache: CacheDictionary = {
        description: {
            cached: false,
        },
        name: {
            cached: false,
        },
        script: {
            cached: false,
        },
        running: {
            cached: false,
        },
    };

    constructor(instance: Unraid, id: string, scriptLocation: string, frequency: string) {
        this.id = id;
        this.scriptLocation = scriptLocation;
        this.frequency = frequency;
        this.instance = instance;
        const scriptNameParts = scriptLocation.split('/');
        scriptNameParts.pop();
        this.scriptDirectory = scriptNameParts.join('/');
    }

    async description() {
        if (this.cache.description.cached) {
            return this.cache.description.value;
        }
        const { code, stdout } = await this.instance.execute(`cat ${this.scriptDirectory}/description`);
        this.cache.description.value = code === 0 ? stdout.join('') : null;
        this.cache.description.cached = true;
        return this.cache.description.value;
    }

    async running(byPassCache?: boolean): Promise<boolean> {
        if (this.cache.running.cached && !byPassCache) {
            return this.cache.running.value;
        }
        const { code } = await this.instance.execute(isUserScriptRunningScript(await this.name()));
        if (code !== 0 && code !== 13) {
            throw new Error('Got non-zero exit code while reading running state of userscript');
        }
        let running = false;
        if (code === 0) running = true;
        this.cache.running.value = running;
        this.cache.running.cached = true;
        return this.cache.running.value;
    }

    async name(): Promise<string> {
        if (this.cache.name.cached) {
            return this.cache.name.value;
        }
        const { code, stdout } = await this.instance.execute(`cat ${this.scriptDirectory}/name`);
        this.cache.name.value = code === 0 ? stdout.join('') : this.id;
        this.cache.name.cached = true;
        return this.cache.name.value;
    }

    async script(): Promise<string> {
        if (this.cache.script.cached) {
            return this.cache.script.value;
        }
        const { code, stdout } = await this.instance.execute(`cat ${this.scriptLocation}`);
        this.cache.script.value = code === 0 ? stdout.join('') : this.id;
        this.cache.script.cached = true;
        return this.cache.script.value;
    }

    async prePopulateCache() {
        return Promise.all([this.script(), this.name(), this.description(), this.running()]);
    }

    get populated() {
        return Object.keys(this.cache)
            .map((v: keyof CacheDictionary) => this.cache[v].cached)
            .reduce((previousValue, currentValue) => previousValue && currentValue, true);
    }

    toJSON() {
        return {
            populated: this.populated,
            name: this.cache.name.value,
            description: this.cache.description.value,
            script: this.cache.script.value,
            id: this.id,
            scriptLocation: this.scriptLocation,
            directory: this.scriptDirectory,
            frequency: this.frequency,
            running: this.cache.running.value,
        };
    }
}
