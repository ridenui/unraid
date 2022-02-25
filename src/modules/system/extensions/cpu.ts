import type { RecursivePartial } from '../../../util/type';
import { SystemModuleExtensionBase } from '../system-module-extension-base';

export interface CoreUsage {
    /**
     * time running un-niced user processes
     */
    usr: number;
    /**
     * time running niced user processes
     */
    nice: number;
    /**
     * time running kernel processes
     */
    sys: number;
    /**
     * time waiting for I/O completion
     */
    ioWait: number;
    /**
     * time spent in the kernel idle handler
     */
    idle: number;
    /**
     * time spent servicing hardware interrupts
     */
    hardwareInterrupts: number;
    /**
     * time spent servicing software interrupts
     */
    softwareInterrupts: number;
    /**
     * time stolen from this vm by the hypervisor
     */
    steal: number;
}

export interface CPUUsage {
    coreCount: number;
    all: CoreUsage;
    cores: (CoreUsage & { core: number })[];
    raw: string[];
}

export type ICpuUsageStreamOption = {
    /**
     * Refresh time in seconds
     */
    refresh?: number;
};

export class SystemModuleCpuExtension extends SystemModuleExtensionBase {
    private static cpuUsageCommand = `COLUMNS=200 TERM=dumb top -1 -n 1 -b | grep '^%Cpu[[:digit:]+]' | tr '\n' '|'`;

    private static cpuLineRegex =
        /%Cpu(?<cpu_core>\d+)\s+:\s+(?<user>\d+.\d+(?=\s+us)).*?,\s*(?<system>\d+.\d+(?=\s+sy)).*?,\s*(?<nice>\d+.\d+(?=\s+ni)).*?,\s*(?<idle>\d+.\d+(?=\s+id)).*?,\s*(?<io_wait>\d+.\d+(?=\s+wa)).*?,\s*(?<hardware_interrupts>\d+.\d+(?=\s+hi)).*?,\s*(?<software_interrupts>\d+.\d+(?=\s+si)).*?,\s*(?<steal>\d+.\d+(?=\s+st))/gm;

    async usage(): Promise<CPUUsage> {
        const { code, stdout } = await this.instance.execute(SystemModuleCpuExtension.cpuUsageCommand);
        if (code !== 0) throw new Error('Got non-zero exit code while getting cpu usage');

        return SystemModuleCpuExtension.parseCpuUsageOutput(stdout);
    }

    private static parseCpuUsageOutput(input: string[]): CPUUsage {
        const tempUsage: RecursivePartial<CPUUsage> = {
            all: {
                usr: 0,
                sys: 0,
                nice: 0,
                hardwareInterrupts: 0,
                idle: 0,
                ioWait: 0,
                softwareInterrupts: 0,
                steal: 0,
            } as CoreUsage,
            cores: [],
            raw: [...input],
        };

        // %Cpu0  :  0.0 us,  0.0 sy,  0.0 ni,100.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
        // %Cpu7  :  0.0 us,  5.0 sy,  0.0 ni, 95.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
        const coreLines = input
            .join('')
            .split('|')
            .filter((v) => v);

        console.log(coreLines);

        for (const line of coreLines) {
            let match = SystemModuleCpuExtension.cpuLineRegex.exec(line);

            while (match !== null) {
                const core = parseInt(match.groups.cpu_core, 10);
                const user = parseFloat(match.groups.user);
                const system = parseFloat(match.groups.system);
                const nice = parseFloat(match.groups.nice);
                const idle = parseFloat(match.groups.idle);
                const ioWait = parseFloat(match.groups.io_wait);
                const hardwareInterrupts = parseFloat(match.groups.hardware_interrupts);
                const softwareInterrupts = parseFloat(match.groups.software_interrupts);
                const steal = parseFloat(match.groups.steal);
                tempUsage.all.usr += user;
                tempUsage.all.sys += system;
                tempUsage.all.nice += nice;
                tempUsage.all.idle += idle;
                tempUsage.all.ioWait += ioWait;
                tempUsage.all.hardwareInterrupts += hardwareInterrupts;
                tempUsage.all.softwareInterrupts += softwareInterrupts;
                tempUsage.all.steal += steal;
                tempUsage.cores.push({
                    core,
                    usr: user,
                    sys: system,
                    nice,
                    idle,
                    ioWait,
                    hardwareInterrupts,
                    softwareInterrupts,
                    steal,
                });
                match = SystemModuleCpuExtension.cpuLineRegex.exec(line);
            }

            SystemModuleCpuExtension.cpuLineRegex.lastIndex = 0;
        }

        tempUsage.all.usr /= tempUsage.cores.length;
        tempUsage.all.sys /= tempUsage.cores.length;
        tempUsage.all.nice /= tempUsage.cores.length;
        tempUsage.all.idle /= tempUsage.cores.length;
        tempUsage.all.ioWait /= tempUsage.cores.length;
        tempUsage.all.hardwareInterrupts /= tempUsage.cores.length;
        tempUsage.all.softwareInterrupts /= tempUsage.cores.length;
        tempUsage.all.steal /= tempUsage.cores.length;

        return tempUsage as CPUUsage;
    }

    on_cpuUsage(listener: (newLoad: CPUUsage) => void, options?: ICpuUsageStreamOption): [() => void] {
        let cancelFunction;

        if (!this.instance.executor.executeStream) {
            throw new Error('Streaming is not supported by this executor');
        }

        const refresh = options?.refresh ?? 1;

        const promise = this.instance.executor
            .executeStream(
                `while [ 1 ]; do ${SystemModuleCpuExtension.cpuUsageCommand} | xargs -0 echo; sleep ${refresh}; done`
            )
            .then(([eventEmitter, cancel, exitPromise]) => {
                cancelFunction = () => {
                    cancel().finally(() => {
                        eventEmitter.removeAllListeners('onNewStdoutLine');
                    });
                };
                eventEmitter.addListener('onNewStdoutLine', (line) => {
                    listener(SystemModuleCpuExtension.parseCpuUsageOutput([line]));
                });
                exitPromise.finally(() => {
                    eventEmitter.removeAllListeners('onNewStdoutLine');
                });
            });

        return [
            () => {
                promise.finally(() => {
                    if (cancelFunction) {
                        cancelFunction();
                    }
                });
            },
        ];
    }
}
