import { execute } from '../../executors/SSH';

/**
 * Returns the current Server Datetime
 * @param parsed - If the date should be returned as JS Date Object
 */
async function date(parsed?: false): Promise<string>;
async function date(parsed?: true): Promise<Date>;
async function date(parsed?: boolean): Promise<string | Date> {
  const { code, stdout } = await execute(`date${parsed ? ' -R' : ''}`);
  if (code !== 0) throw new Error('Got non-zero exit code while getting date');
  if (parsed) {
    return new Date(stdout.join(''));
  }
  return stdout.join('');
}

export { date };
