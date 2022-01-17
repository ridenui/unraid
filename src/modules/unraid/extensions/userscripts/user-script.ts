import type { Union } from 'ts-toolbelt';
import { Executor } from '../../../../instance/executor';
import { Unraid } from '../../../../instance/unraid';

type CacheState<Value> = {
  cached: boolean;
  value?: Value;
};

type CachedProperties =
  | { name: 'description'; value: string }
  | { name: 'name'; value: string }
  | { name: 'script'; value: string };

type CacheDictionary<Keys extends string = CachedProperties['name']> = {
  [key in Keys]: CacheState<Union.Select<CachedProperties, { name: key }>['value']>;
};

export class UserScript<ExecutorConfig, Ex extends Executor<ExecutorConfig> = Executor<ExecutorConfig>> {
  private readonly instance: Unraid<ExecutorConfig, Ex>;

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
  };

  constructor(instance: Unraid<ExecutorConfig, Ex>, id: string, scriptLocation: string, frequency: string) {
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

  async name() {
    if (this.cache.name.cached) {
      return this.cache.name.value;
    }
    const { code, stdout } = await this.instance.execute(`cat ${this.scriptDirectory}/name`);
    this.cache.name.value = code === 0 ? stdout.join('') : this.id;
    this.cache.name.cached = true;
    return this.cache.name.value;
  }

  async script() {
    if (this.cache.script.cached) {
      return this.cache.script.value;
    }
    const { code, stdout } = await this.instance.execute(`cat ${this.scriptLocation}`);
    this.cache.script.value = code === 0 ? stdout.join('') : this.id;
    this.cache.script.cached = true;
    return this.cache.script.value;
  }

  async prePopulateCache() {
    return Promise.all([this.script(), this.name(), this.description()]);
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
    };
  }
}
