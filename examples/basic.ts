/*
    This is a very basic example. Make sure to set your environment correctly.
    If you don't know how, check out the README.md :)
 */
import { SSHConfig, SSHExecutor } from '../src/executors/SSH';
import { Unraid, UnraidConfig } from '../src/instance/unraid';

(async () => {
  console.log('Start');

  const unraid = new Unraid({
    executor: SSHExecutor,
    executorConfig: {
      host: process.env.SSH_HOST,
      password: process.env.SSH_PASSWORD,
      username: process.env.SSH_USER,
      port: parseInt(process.env.SSH_PORT ?? '22', 10),
    },
  } as UnraidConfig<SSHConfig, SSHExecutor>);

  const vms = await unraid.vm.list();

  console.log(vms);

  const remoteDate = await unraid.system.date(true);

  const diskfree = await unraid.system.diskfree();

  const info = await unraid.system.info();

  const lsblk = await unraid.system.lsblk({ all: true });

  // const lsusb = await unraid.system.lsusb();

  const ntp = await unraid.system.ntp();

  const smartctl = await unraid.system.smartctl({ deviceName: '/dev/sda1', all: true });

  const syslog = await unraid.system.syslog({ lines: 10 });

  // const uptime = await unraid.system.uptime();

  const users = await unraid.system.users();

  console.log({ remoteDate, diskfree, info, lsblk, ntp, smartctl, syslog, users });

  unraid.executor.disconnect();
})();
