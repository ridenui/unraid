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
    const img = await containers[0].getImage();
    const checksum = await containers[0].getImageChecksum();
    console.log(img.checksum);
    console.log(checksum);

    unraid.executor.disconnect();
})();
