import SSHClient from 'react-native-ssh-sftp';
import { executor as Executor } from '../instance';

export type SSHConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
};

export class ReactNativeExecutor extends Executor.Executor<SSHConfig> {
  private connection: SSHClient;

  private ready = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection = new SSHClient(
        this.config.host,
        this.config.port,
        this.config.username,
        this.config.password,
        (error) => {
          if (error) reject(error);
          this.ready = true;
          resolve();
        }
      );
    });
  }

  disconnect(): void {
    this.connection.disconnect();
  }

  execute(command: Executor.IExecuteSimple): Promise<Executor.IExecuteResult>;

  execute({ command }: Executor.IExecute): Promise<Executor.IExecuteResult>;

  execute(command: Executor.IExecuteSimple | Executor.IExecute): Promise<Executor.IExecuteResult>;

  async execute(command: Executor.IExecuteSimple | Executor.IExecute): Promise<Executor.IExecuteResult> {
    if (!this.ready) await this.connect();
    return new Promise((resolve, reject) => {
      if (typeof command === 'object') command = command.command;
      this.connection.execute(command, (error, output) => {
        if (error) reject(error);
        const response = {
          stderr: [],
          stdout: output.split('\n'),
        };
        resolve({
          ...response,
          code: 0,
          signal: 0,
        });
      });
    });
  }
}
