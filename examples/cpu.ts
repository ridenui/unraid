/*
    This is a very basic example. Make sure to set your environment correctly.
    If you don't know how, check out the README.md :)
 */
import { SSHExecutor } from '../src/executors';
import { Unraid } from '../src/instance/unraid';

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

    const usage = await unraid.system.usage();

    console.log(usage);

    unraid.executor.disconnect();
})();
