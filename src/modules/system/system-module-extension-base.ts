import { Unraid } from '../../instance/unraid';

export class SystemModuleExtensionBase {
    readonly instance: Unraid;

    constructor(instance: Unraid) {
        this.instance = instance;
    }
}
