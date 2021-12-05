import { EventEmitter } from 'events';
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
        if (err) {
          reject(err);
          return;
        }
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

  async executeStream(
    command: Executor.IExecuteSimple | Executor.IExecute
  ): Promise<[EventEmitter, Executor.CancelFunction, Promise<Executor.IExecuteStreamResult>]> {
    if (!this.ready) await this.connect();
    if (typeof command === 'object') command = command.command;
    let resolve: (value: Executor.IExecuteStreamResult | PromiseLike<Executor.IExecuteStreamResult>) => void;
    let reject: (reason: any) => void;
    let didExit = false;
    const resolvePromise = new Promise<Executor.IExecuteStreamResult>((re, rej) => {
      resolve = re;
      reject = rej;
    });
    const eventEmitter = new EventEmitter();
    let internalCancelCallback;
    const cancelCallback = async () => {
      if (internalCancelCallback) {
        internalCancelCallback();
      }
    };
    this.connection.exec(command, (err, stream) => {
      if (err) {
        reject(err);
        return;
      }
      internalCancelCallback = () => {
        stream.signal('SIGABRT');
        setTimeout(() => {
          if (!didExit) {
            stream.signal('SIGKILL');
            stream.close();
          }
        }, 1000);
      };
      let lineBufferStdout = '';
      let lineBufferStderr = '';
      stream.stdout.on('data', (data) => {
        const dataString = data.toString();
        eventEmitter.emit('onStdout', dataString);
        for (let i = 0; i < dataString.length; i++) {
          if (dataString[i] === '\n') {
            eventEmitter.emit('onNewStdoutLine', lineBufferStdout);
            lineBufferStdout = '';
          } else {
            lineBufferStdout += dataString[i];
          }
        }
      });
      stream.stderr.on('data', (data) => {
        const dataString = data.toString();
        eventEmitter.emit('onStderr', dataString);
        for (let i = 0; i < dataString.length; i++) {
          if (dataString[i] === '\n') {
            eventEmitter.emit('onNewStderrLine', lineBufferStderr);
            lineBufferStderr = '';
          } else {
            lineBufferStderr += dataString[i];
          }
        }
      });
      stream.stdout.on('end', () => {
        if (lineBufferStdout) {
          eventEmitter.emit('onNewStdoutLine', lineBufferStdout);
        }
      });
      stream.stderr.on('end', () => {
        if (lineBufferStderr) {
          eventEmitter.emit('onNewStderrLine', lineBufferStderr);
        }
      });
      stream.on('close', (code, signal) => {
        didExit = true;
        resolve({
          code,
          signal,
        });
      });
    });
    return [eventEmitter, cancelCallback, resolvePromise];
  }
}
