import { Client, ConnectConfig } from 'ssh2';
import { executor as Executor } from '../instance';

export type SSHConfig = ConnectConfig;

export class SSHExecutor extends Executor.Executor<SSHConfig> {
  private connection: Client = new Client();

  private ready = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.on('ready', () => {
        this.ready = true;
        resolve();
      });
      this.connection.on('error', reject);
      this.connection.on('close', () => {
        this.ready = false;
      });
      this.connection.connect(this.config);
    });
  }

  disconnect(): void {
    this.connection.end();
  }

  execute(command: Executor.IExecuteSimple): Promise<Executor.IExecuteResult>;

  execute({ command }: Executor.IExecute): Promise<Executor.IExecuteResult>;

  execute(command: Executor.IExecuteSimple | Executor.IExecute): Promise<Executor.IExecuteResult>;

  async execute(command: Executor.IExecuteSimple | Executor.IExecute): Promise<Executor.IExecuteResult> {
    if (!this.ready) await this.connect();
    return new Promise((resolve, reject) => {
      if (typeof command === 'object') command = command.command;
      this.connection.exec(command, (err, stream) => {
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
}
