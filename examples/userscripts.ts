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

    for (const us of result) {
        if (us.dirName === 'test') {
            console.log(`Running: ${await us.running(true)}`);
            await us.startBackground();
            console.log(`Running: ${await us.running(true)}`);
            await us.abort();
            console.log(`Running: ${await us.running(true)}`);
            const [emitter, cancel, resultPromise] = await us.start();
            emitter.on('onNewStdoutLine', (line) => console.log(line));
            await resultPromise;
        }
    }

    unraid.executor.disconnect();
})();
