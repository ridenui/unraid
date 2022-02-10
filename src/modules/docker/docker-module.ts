import { IExecuteResult } from '../../instance/executor';
import { Unraid } from '../../instance/unraid';
import { Container } from './container';
import { RawContainer } from './docker.types';

export class DockerModule {
  private readonly instance: Unraid;

  constructor(instance: Unraid) {
    this.instance = instance;
  }

  private async fetch(path: string): Promise<IExecuteResult> {
    return this.instance.execute(`curl --unix-socket /var/run/docker.sock ${path}`);
  }

  async list(): Promise<Container[]> {
    const { stdout, code } = await this.fetch('http://localhost/v1.41/containers/json');
    if (code !== 0) throw new Error('Got non-zero exit code while listing containers');
    const json: RawContainer[] = JSON.parse(stdout[0]);
    return json.map((container) => new Container(this.instance, container));
  }
}
