import { execute } from '../../executors/SSH';

async function list(): Promise<string[][]> {
  const { stdout, code } = await execute('virsh list --all');
  if (code !== 0) throw new Error('Got non-zero exit code while listing vms');
  const vms = stdout.slice(2);
  return vms.map((value) => {
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

    return [
      v.slice(0, firstColumnEnd).trim(),
      v.slice(firstColumnEnd, lastColumnStart).trim(),
      v.slice(lastColumnStart, v.length).trim(),
    ];
  });
}

export { list };
