import { EventEmitter } from 'events';
import { Client, ConnectConfig } from 'ssh2';
import { executor as Executor } from '../instance';
import { ExecutorConfigType } from '../instance/executor';
import { CommandQueue } from '../util/command-queue';

export type SSHConfig = ConnectConfig & ExecutorConfigType;

/**
 * SSHExecutor built for the usage with nodejs.
 * Under the hood it uses [ssh2](https://github.com/mscdex/ssh2)
 */
export class SSHExecutor extends Executor.Executor<SSHConfig> {
  private connection: Client = new Client();

  private ready = false;

  private commandQueue = new CommandQueue();

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

  execute(command: Executor.IExecuteSimple | Executor.IExecute): Promise<Executor.IExecuteResult> {
    return this.commandQueue.doTask(() => this.executeSSH(command));
  }

  async executeSSH(command: Executor.IExecuteSimple | Executor.IExecute): Promise<Executor.IExecuteResult> {
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
        let lineBufferStdout = '';
        let lineBufferStderr = '';
        stream.stdout.on('data', (data) => {
          const dataString = data.toString();
          for (let i = 0; i < dataString.length; i++) {
            if (dataString[i] === '\n') {
              response.stdout = response.stdout.concat(lineBufferStdout);
              lineBufferStdout = '';
            } else {
              lineBufferStdout += dataString[i];
            }
          }
        });
        stream.stderr.on('data', (data) => {
          const dataString = data.toString();
          for (let i = 0; i < dataString.length; i++) {
            if (dataString[i] === '\n') {
              response.stderr = response.stderr.concat(lineBufferStderr);
              lineBufferStderr = '';
            } else {
              lineBufferStderr += dataString[i];
            }
          }
        });
        stream.on('close', (code, signal) => {
          if (lineBufferStdout) {
            response.stdout = response.stdout.concat(lineBufferStdout);
          }
          if (lineBufferStderr) {
            response.stderr = response.stderr.concat(lineBufferStderr);
          }
          resolve({
            ...response,
            code,
            signal,
          });
        });
      });
    });
  }

  executeStream(
    command: Executor.IExecuteSimple | Executor.IExecute
  ): Promise<[EventEmitter, Executor.CancelFunction, Promise<Executor.IExecuteStreamResult>]> {
    return this.commandQueue.doTask(() => this.executeStreamSSH(command));
  }

  async executeStreamSSH(
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
