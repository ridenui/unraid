import { Unraid } from '../../src';
import { UnraidConfig } from '../../src/instance/unraid';
import { SSHConfig, TestExecutor } from '../executor/TestExecutor';

export function getInstance(): Unraid<SSHConfig, TestExecutor> {
  return new Unraid({
    executor: TestExecutor,
    executorConfig: {},
  } as UnraidConfig<SSHConfig, TestExecutor>);
}
