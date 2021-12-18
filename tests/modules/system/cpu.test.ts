import '@system/cpu';
import { Unraid } from '../../../src';
import { SSHConfig, TestExecutor } from '../../executor/TestExecutor';
import { getInstance } from '../../helpers/getInstance';

describe('system - cpu', () => {
  let instance: Unraid<SSHConfig, TestExecutor>;

  beforeAll(() => {
    instance = getInstance();
    global.mock = 'cpu';
  });

  it('usage', async () => {
    const usage = await instance.system.usage();
    expect(usage).toMatchSnapshot();
  });
});
