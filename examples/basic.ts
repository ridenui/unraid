/*
    This is a very basic example. Make sure to set your environment correctly.
    If you don't know how, check out the README.md :)
 */
import { ssh, system, vm } from '../src/index';

(async () => {
  const vms = await vm.list();
  const ntp = await system.ntp();
  console.log(`Hey, you have ${vms.length} VMs`);
  console.log(`And btw., you have ${ntp.length} ntp servers.`);
  await ssh.disconnect();
})();
