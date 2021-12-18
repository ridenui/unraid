import * as fs from 'fs/promises';
import * as path from 'path';
import { executor as Executor } from '../../src/instance';

export type SSHConfig = Record<string, string>;

export class TestExecutor extends Executor.Executor<SSHConfig> {
  private ready = false;

  async connect(): Promise<void> {
    this.ready = true;
  }

  disconnect(): void {
    this.ready = false;
  }

  execute(command: Executor.IExecuteSimple): Promise<Executor.IExecuteResult>;

  execute({ command }: Executor.IExecute): Promise<Executor.IExecuteResult>;

  execute(command: Executor.IExecuteSimple | Executor.IExecute): Promise<Executor.IExecuteResult>;

  async execute(command: Executor.IExecuteSimple | Executor.IExecute): Promise<Executor.IExecuteResult> {
    if (!this.ready) await this.connect();
    if (typeof command === 'object') command = command.command;
    const file = await fs.readFile(
      `${path.join(__dirname, 'mocks', TestExecutor.sanitizeCommand(global.mock || command))}.txt`,
      {
        encoding: 'utf-8',
      }
    );
    return {
      code: 0,
      signal: '',
      stderr: [],
      stdout: [file.trim()],
    };
  }

  private static sanitizeCommand(command: string): string {
    return command.replace(/ /g, '_').replace(/'/g, '_').replace(/"/g, '_');
  }
}
