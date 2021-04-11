import { Client } from 'ssh2';

let connection: Client;
let ready = false;

function connect(): Promise<void> {
  return new Promise((resolve, reject) => {
    connection = new Client();
    connection.on('ready', () => {
      ready = true;
      resolve();
    });
    connection.on('error', reject);
    connection.on('close', () => {
      ready = false;
    });
    connection.connect({
      host: process.env.SSH_HOST,
      password: process.env.SSH_PASSWORD,
      username: process.env.SSH_USER,
      port: parseInt(process.env.SSH_PORT, 10),
    });
  });
}

function disconnect(): void {
  connection.end();
}

type IExecute = {
  command: string;
};

type IExecuteResult = {
  stdout: string[];
  stderr: string[];
  code: number;
  signal?: unknown;
};

type IExecuteSimple = string;

async function execute(command: IExecuteSimple): Promise<IExecuteResult>;
async function execute({ command }: IExecute): Promise<IExecuteResult>;
async function execute(command: IExecuteSimple | IExecute): Promise<IExecuteResult> {
  if (!ready) await connect();
  return new Promise((resolve, reject) => {
    if (typeof command === 'object') command = command.command;
    connection.exec(command, (err, stream) => {
      if (err) reject(err);
      const response = {
        stderr: [],
        stdout: [],
      };
      stream.stdout.on('data', (data) => {
        const output = data.toString().trim().split('\n');
        response.stdout = response.stdout.concat(output);
      });
      stream.stderr.on('data', (data) => {
        const output = data.toString().trim().split('\n');
        response.stderr = response.stderr.concat(output);
      });
      stream.on('close', (code, signal) => {
        resolve({
          ...response,
          code,
          signal,
        });
      });
    });
  });
}

export { connect, disconnect, execute };
