import { Executor } from '../../instance/executor';
import { Unraid } from '../../instance/unraid';

export enum VMState {
  RUNNING = 'running',
  STOPPED = 'shut off',
  PAUSED = 'paused',
  IDL = 'idle',
  IN_SHUTDOWN = 'in shutdown',
  CRASHED = 'crashed',
  SUSPENDED = 'pmsuspended',
}

export type IVMShutdownModes = 'acpi' | 'agent' | 'initctl' | 'signal' | 'paravirt';

export type IVMRebootModes = 'acpi' | 'agent' | 'initctl';

export type IVMRawReturn = {
  raw: string[];
};

export class VM<ExecutorConfig, Ex extends Executor<ExecutorConfig>> {
  private readonly instance: Unraid<ExecutorConfig, Ex>;

  readonly name: string;

  state: VMState;

  id?: string;

  constructor(instance: Unraid<ExecutorConfig, Ex>, name: string, state: VMState, id?: string) {
    this.instance = instance;
    this.name = name;
    this.state = state;
    this.id = id;
  }

  async shutdown(mode: IVMShutdownModes): Promise<IVMRawReturn> {
    if (!mode) mode = 'acpi';
    const { stdout, code } = await this.instance.execute(`virsh shutdown "${this.name}" --mode ${mode}`);
    if (code !== 0) throw new Error(`Got non-zero exit code while shutting down vm "${this.name}" with mode "${mode}"`);
    return {
      raw: stdout,
    };
  }

  async suspend(): Promise<IVMRawReturn> {
    const { stdout, code } = await this.instance.execute(`virsh suspend "${this.name}"`);
    if (code !== 0) throw new Error(`Got non-zero exit code while resetting vm "${this.name}"`);
    return {
      raw: stdout,
    };
  }

  async reset(): Promise<IVMRawReturn> {
    const { stdout, code } = await this.instance.execute(`virsh reset "${this.name}"`);
    if (code !== 0) throw new Error(`Got non-zero exit code while resetting vm "${this.name}"`);
    return {
      raw: stdout,
    };
  }

  async start(): Promise<IVMRawReturn> {
    const { stdout, code } = await this.instance.execute(`virsh start "${this.name}"`);
    if (code !== 0) throw new Error(`Got non-zero exit code while starting vm "${this.name}"`);
    return {
      raw: stdout,
    };
  }

  async autostart(disable?: boolean): Promise<IVMRawReturn> {
    const { stdout, code } = await this.instance.execute(
      `virsh autostart "${this.name}"${disable ? ' --disable' : ''}`
    );
    if (code !== 0) throw new Error(`Got non-zero exit code while autostarting vm "${this.name}"`);
    return {
      raw: stdout,
    };
  }

  async reboot(mode: IVMRebootModes): Promise<IVMRawReturn> {
    if (!mode) mode = 'acpi';
    const { stdout, code } = await this.instance.execute(`virsh reboot "${this.name}" --mode ${mode}`);
    if (code !== 0) throw new Error(`Got non-zero exit code while rebooting vm "${this.name}"`);
    return {
      raw: stdout,
    };
  }

  async resume(): Promise<IVMRawReturn> {
    const { stdout, code } = await this.instance.execute(`virsh resume "${this.name}"`);
    if (code !== 0) throw new Error(`Got non-zero exit code while resuming vm "${this.name}"`);
    return {
      raw: stdout,
    };
  }

  toJSON() {
    return {
      name: this.name,
      state: this.state,
      id: this.id,
    };
  }
}
