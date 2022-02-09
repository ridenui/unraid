import { Unraid } from '../../instance/unraid';
import { Container as ContainerType } from './docker.types';

export class Container {
  private readonly instance: Unraid;

  readonly id: string;

  readonly data: ContainerType;

  constructor(instance: Unraid, data: ContainerType) {
    this.instance = instance;
    this.data = data;
    this.id = data.Id;
  }

  get name() {
    return this.data.Names[0].replace('/', '');
  }

  get imageUrl() {
    return `/state/plugins/dynamix.docker.manager/images/${this.name}-icon.png`;
  }

  get state() {
    return this.data.State;
  }

  get created() {
    return new Date(this.data.Created * 1000);
  }

  async stop(): Promise<void> {
    const { code } = await this.instance.execute(`docker stop "${this.id}"`);
    if (code !== 0) throw new Error(`Got non-zero exit code while stopping container "${this.id}"`);
  }
}
