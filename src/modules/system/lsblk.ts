import { execute } from '../../ssh/SSH';

type ILsblk = {
  all?: boolean;
};

/**
 * List all block devices
 * @param all - toggles --all flag in lsblk
 * @example Get basic information
 * ```ts
 * await lsblk();
 * await lsblk({all: false});
 * ```
 *
 * @example Get all information
 * ```ts
 * await lsblk({all: true});
 * ```
 */
async function lsblk({ all = false }: ILsblk = {}): Promise<Record<never, never>> {
  const { code, stdout } = await execute(`lsblk -J ${all ? '--all' : ''}`);
  if (code !== 0) throw new Error('Got non-zero exit code while listing block devices');
  return JSON.parse(stdout.join(''));
}

export { lsblk };
