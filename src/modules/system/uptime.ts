import { execute } from '../../executors/SSH';

const regex =
  /(.*)\sup\s(\d*)\sdays,\s(\d*):(\d*),\s\s(\d*)\suser,\s\sload average:\s(\d*\.\d*),\s(\d*\.\d*),\s(\d*\.\d*)/gm;

type IUptime = {
  raw: string;
  currentTime: number;
  upDays: number;
  upHours: number;
  upMinutes: number;
  users: number;
  loadAverages: {
    1: number;
    5: number;
    15: number;
  };
};

async function uptime(): Promise<IUptime> {
  const { code, stdout } = await execute('uptime');
  if (code !== 0) throw new Error('Got non-zero exit code while getting  uptime');
  const [input, time, days, hours, minutes, users, load1min, load5min, load15min] = regex.exec(stdout[0]);
  return {
    raw: input,
    currentTime: parseInt(time, 10),
    upDays: parseInt(days, 10),
    upHours: parseInt(hours, 10),
    upMinutes: parseInt(minutes, 10),
    users: parseInt(users, 10),
    loadAverages: {
      1: parseFloat(load1min),
      5: parseFloat(load5min),
      15: parseFloat(load15min),
    },
  };
}

export { uptime };
