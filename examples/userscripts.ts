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

    await unraid.executor.connect();

    const result = await unraid.unraid.getUserScripts();

    console.log(JSON.stringify(result, null, 4));
    unraid.executor.disconnect();
})();
