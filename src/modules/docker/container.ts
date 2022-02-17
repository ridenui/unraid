import { Unraid } from '../../instance/unraid';
import { ContainerStates, RawContainer } from './docker.types';

const questionIconLocation = '/usr/local/emhttp/plugins/dynamix.docker.manager/images/question.png';

export class Container {
  private readonly instance: Unraid;

  readonly id: string;

  readonly data: RawContainer;

  private image: string | undefined;

  constructor(instance: Unraid, data: RawContainer) {
    this.instance = instance;
    this.data = data;
    this.id = data.Id;
  }

  get name(): string {
    return this.data.Names[0].replace('/', '');
  }

  /**
   * Returns the container image as base64 encoded image. Falls back to the default question logo in case no icon is found
   */
  async getImage(): Promise<string> {
    if (this.image) return this.image;
    const filePath = `/var/lib/docker/unraid/images/${this.name}-icon.png`;
    const { stdout, stderr, code } = await this.instance.execute(
      `[ -f ${filePath} ] && base64 ${filePath} || base64 ${questionIconLocation}`
    );
    if (code !== 0)
      throw new Error(`Unable to read image for container ${this.id} / ${this.name}.\n${stdout}\n${stderr}`);
    const image = stdout.join('');
    this.image = image;
    return image;
  }

  get state(): ContainerStates {
    return this.data.State;
  }

  get created(): Date {
    return new Date(this.data.Created * 1000);
  }

  async stop(): Promise<void> {
    const { code } = await this.instance.execute(`docker stop "${this.id}"`);
    if (code !== 0) throw new Error(`Got non-zero exit code while stopping container "${this.id}"`);
  }
}
