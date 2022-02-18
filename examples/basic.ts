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

    const hostname = await unraid.system.getHostname();

    console.log(hostname);

    const usage = await unraid.system.usage();

    console.log(usage);

    const [cancel] = unraid.system.on('syslog', (line) => {
        console.log(`New line: ${line}`);
    });

    const [cancelLoad] = unraid.system.on('loadAverage', (load) => {
        console.log(load);
    });

    const [cancelUsage] = unraid.system.on('cpuUsage', (currentUsage) => {
        console.log(currentUsage);
    });

    await new Promise<void>((resolve) => {
        setTimeout(() => {
            cancel();
            cancelLoad();
            cancelUsage();
            resolve();
        }, 5000);
    });

    unraid.executor.disconnect();
})();
