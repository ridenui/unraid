import { execute } from '../../ssh/SSH';

type IVMShutdownModes = 'acpi' | 'agent' | 'initctl' | 'signal' | 'paravirt';

type IVMRawReturn = {
  raw: string[];
};

type IVMShutdown = {
  mode?: IVMShutdownModes;
  name: string;
};

async function shutdown({ mode, name }: IVMShutdown): Promise<IVMRawReturn> {
  if (!mode) mode = 'acpi';
  const { stdout, code } = await execute(`virsh shutdown ${name} --mode ${mode}`);
  if (code !== 0) throw new Error(`Got non-zero exit code while shutting down vm "${name}" with mode "${mode}"`);
  return {
    raw: stdout,
  };
}

type IVMNameType = {
  name: string;
};

async function suspend({ name }: IVMNameType): Promise<IVMRawReturn> {
  const { stdout, code } = await execute(`virsh suspend ${name}`);
  if (code !== 0) throw new Error(`Got non-zero exit code while resetting vm "${name}"`);
  return {
    raw: stdout,
  };
}

async function reset({ name }: IVMNameType): Promise<IVMRawReturn> {
  const { stdout, code } = await execute(`virsh reset ${name}`);
  if (code !== 0) throw new Error(`Got non-zero exit code while resetting vm "${name}"`);
  return {
    raw: stdout,
  };
}

async function start({ name }: IVMNameType): Promise<IVMRawReturn> {
  const { stdout, code } = await execute(`virsh start ${name}`);
  if (code !== 0) throw new Error(`Got non-zero exit code while starting vm "${name}"`);
  return {
    raw: stdout,
  };
}

type IVMAutostartType = {
  name: string;
  disable?: boolean;
};

async function autostart({ name, disable }: IVMAutostartType): Promise<IVMRawReturn> {
  const { stdout, code } = await execute(`virsh autostart ${name}${disable ? ' --disable' : ''}`);
  if (code !== 0) throw new Error(`Got non-zero exit code while autostarting vm "${name}"`);
  return {
    raw: stdout,
  };
}

type IVMReboot = {
  name: string;
  mode?: 'acpi' | 'agent' | 'initctl';
};

async function reboot({ name, mode }: IVMReboot): Promise<IVMRawReturn> {
  if (!mode) mode = 'acpi';
  const { stdout, code } = await execute(`virsh reboot ${name} --mode ${mode}`);
  if (code !== 0) throw new Error(`Got non-zero exit code while rebooting vm "${name}"`);
  return {
    raw: stdout,
  };
}

async function resume({ name }: IVMNameType): Promise<IVMRawReturn> {
  const { stdout, code } = await execute(`virsh resume ${name}`);
  if (code !== 0) throw new Error(`Got non-zero exit code while resuming vm "${name}"`);
  return {
    raw: stdout,
  };
}

export { autostart, reboot, reset, resume, shutdown, start, suspend };
