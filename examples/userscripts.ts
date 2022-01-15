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

  const schedule = await unraid.unraid.getUserScriptSchedule();

  for (const task of Object.keys(schedule)) {
    console.log(await unraid.unraid.getUserScriptsScript(task));
  }

  unraid.executor.disconnect();
})();
