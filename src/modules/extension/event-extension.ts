import { Unraid } from '../../instance/unraid';
import { PropType } from '../../util';

export type EventTypeSchemaType<HT = unknown, OT = unknown> = {
    [key: string]: {
        handlerType: HT;
        optionType?: OT;
    };
};

export class EventExtension<EventTypeSchema extends EventTypeSchemaType = EventTypeSchemaType> {
    readonly instance: Unraid;

    constructor(instance: Unraid) {
        this.instance = instance;
    }

    on<Key extends keyof EventTypeSchema>(
        module: Key,
        listener: (value: PropType<PropType<EventTypeSchema, Key>, 'handlerType'>) => void,
        options?: PropType<PropType<EventTypeSchema, Key>, 'optionType'>
    ): [() => void] {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const moduleHandler = this[`on_${module}`];

        if (!moduleHandler) {
            throw new Error(`Can not find module handler for ${module}`);
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const [cancel] = this[`on_${module}`](listener, options);

        return [() => cancel()];
    }
}
