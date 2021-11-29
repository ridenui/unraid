import { execute } from '../../executors/SSH';

type ISyslog = {
  lines?: number;
};

async function syslog({ lines }: ISyslog = {}): Promise<string[]> {
  const { code, stdout } = await execute(`tail ${lines ? `--lines ${lines}` : ''} /var/log/syslog`);
  if (code !== 0) throw new Error('Got non-zero exit code while reading syslog');
  return stdout;
}

export { syslog };
