import { Unraid } from '../../instance/unraid';
import { ContainerStates, RawContainer } from './docker.types';

const questionIconLocation = '/usr/local/emhttp/plugins/dynamix.docker.manager/images/question.png';

export type ContainerImage = {
  /** base64 encoded string of the image */
  encoded: string;
  /** SHA512 checksum of the *encoded* image */
  checksum: string;
};

export class Container {
  private readonly instance: Unraid;

  readonly id: string;

  readonly data: RawContainer;

  private image: ContainerImage | undefined;

  constructor(instance: Unraid, data: RawContainer) {
    this.instance = instance;
    this.data = data;
    this.id = data.Id;
  }

  get name(): string {
    return this.data.Names[0].replace('/', '');
  }

  private get imagePath(): string {
    return `/var/lib/docker/unraid/images/${this.name}-icon.png`;
  }

  /**
   * Returns the container image as base64 encoded image and it's SHA512 hash. Falls back to the default question logo in case no icon is found.
   */
  async getImage(ignoreCache?: boolean): Promise<ContainerImage> {
    if (this.image && !ignoreCache) return this.image;
    const filePath = this.imagePath;
    const { stdout, stderr, code } = await this.instance.execute(
      `[ -f ${filePath} ] && (base64 ${filePath} && base64 -w 0 ${filePath} | sha512sum) || (base64 ${questionIconLocation} && base64 -w 0 ${questionIconLocation} | sha512sum)`
    );
    if (code !== 0)
      throw new Error(`Unable to read image for container ${this.id} / ${this.name}.\n${stdout}\n${stderr}`);
    const checksum = stdout.pop().split(' ')[0];
    const image = stdout.join('');
    this.image = {
      encoded: image,
      checksum,
    };
    return this.image;
  }

  /**
   * Returns the SHA512 of the base64 encoded icon
   */
  async getImageChecksum(): Promise<ContainerImage['checksum']> {
    const filePath = this.imagePath;

    const { stdout, stderr, code } = await this.instance.execute(
      `[ -f ${filePath} ] && (base64 -w 0 ${filePath} | sha512sum) || (base64 -w 0 ${questionIconLocation} | sha512sum)`
    );
    if (code !== 0) {
      throw new Error(
        `Unable to calculate image checksum for container ${this.id} / ${this.name}.\n${stdout}\n${stderr}`
      );
    }
    return stdout.join('').split(' ')[0];
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
