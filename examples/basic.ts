/*
    This is a very basic example. Make sure to set your environment correctly.
    If you don't know how, check out the README.md :)
 */
import { SSHConfig, SSHExecutor } from '../src/executors';
import { Unraid, UnraidConfig } from '../src/instance/unraid';

(async () => {
  const unraid = new Unraid({
    executor: SSHExecutor,
    executorConfig: {
      host: process.env.SSH_HOST,
      password: process.env.SSH_PASSWORD,
      username: process.env.SSH_USER,
      port: parseInt(process.env.SSH_PORT ?? '22', 10),
    },
  } as UnraidConfig<SSHConfig, SSHExecutor>);

  const hostname = await unraid.system.getHostname();

  console.log(hostname);

  const [cancel] = unraid.system.on('syslog', (line) => {
    console.log(`New line: ${line}`);
  });

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      cancel();
      resolve();
    }, 5000);
  });

  unraid.executor.disconnect();
})();
