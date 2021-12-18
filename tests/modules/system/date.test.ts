import '@system/date';
import { Unraid } from '../../../src';
import { SSHConfig, TestExecutor } from '../../executor/TestExecutor';
import { getInstance } from '../../helpers/getInstance';

describe('system - date', () => {
  let instance: Unraid<SSHConfig, TestExecutor>;

  beforeAll(() => {
    instance = getInstance();
  });

  it('raw', async () => {
    const date = await instance.system.date();
    expect(typeof date).toBe('string');
    expect(date.trim()).toEqual(date);
    expect(date).toMatchSnapshot();
  });

  it('parsed', async () => {
    const date = await instance.system.date(true);
    expect(typeof date).toBe('object');
    expect(date).toMatchSnapshot();
  });
});
