import { Executor } from '../../instance/executor';
import { Unraid } from '../../instance/unraid';
import { VM, VMState } from './vm';

export class VMModule<ExecutorConfig, Ex extends Executor<ExecutorConfig>> {
  private readonly instance: Unraid<ExecutorConfig, Ex>;

  constructor(instance: Unraid<ExecutorConfig, Ex>) {
    this.instance = instance;
  }

  async list(): Promise<VM<ExecutorConfig, Ex>[]> {
    const { stdout, code } = await this.instance.execute('virsh list --all');
    if (code !== 0) throw new Error('Got non-zero exit code while listing vms');
    const vms = stdout.slice(2);
    const parsedTable = vms.map((value) => {
      const v = value.trim();
      let spaceCount = 0;
      let firstColumnEnd;
      let lastColumnStart;

      for (let i = 0; i < v.length; i += 1) {
        if (v[i] === ' ') spaceCount += 1;
        if (spaceCount === 2) {
          firstColumnEnd = i;
          spaceCount = 0;
          break;
        }
      }

      for (let i = v.length - 1; i > 0; i -= 1) {
        if (v[i] === ' ') spaceCount += 1;
        if (spaceCount === 2) {
          lastColumnStart = i;
          break;
        }
      }

      const id = v.slice(0, firstColumnEnd).trim();

      return [
        id === '-' ? undefined : id,
        v.slice(firstColumnEnd, lastColumnStart).trim(),
        v.slice(lastColumnStart, v.length).trim(),
      ];
    });

    return parsedTable.map(([id, name, state]) => {
      return new VM(this.instance, name, state as VMState, id);
    });
  }
}
