import { execute } from '../../ssh/SSH';

interface IDiskFreeReturn {
  fs: string;
  blocks: number;
  used: number;
  available: number;
  mounted: string;
}

/**
 * Returns the current disk free stats
 */
async function diskfree(): Promise<IDiskFreeReturn[]> {
  const { code, stdout } = await execute('df');
  if (code !== 0) throw new Error('Got non-zero exit code while running df');

  stdout.shift();

  return stdout.map((line) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [fs, blocks, used, available, _, mounted] = line.split(' ').filter((v) => v);
    return {
      fs,
      blocks: parseInt(blocks, 10),
      used: parseInt(used, 10),
      available: parseInt(available, 10),
      mounted,
    };
  });
}

export { diskfree };
