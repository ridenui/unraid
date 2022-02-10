import { Unraid } from '../src';
import { SSHExecutor } from '../src/executors';

(async () => {
  const unraid = new Unraid({
    executor: SSHExecutor,
    executorConfig: {
      host: process.env.SSH_HOST,
      password: process.env.SSH_PASSWORD,
      username: process.env.SSH_USER,
      port: parseInt(process.env.SSH_PORT ?? '22', 10),
    },
  });

  const containers = await unraid.docker.list();
  containers.forEach((container) => {
    console.log(`${container.name} - ${container.state}`);
  });

  unraid.executor.disconnect();
})();
