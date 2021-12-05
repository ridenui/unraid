import { Executor } from '../../instance/executor';
import { Unraid } from '../../instance/unraid';

export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export class EventExtension<ExecutorConfig, Ex extends Executor<ExecutorConfig>, EventTypeSchema> {
  readonly instance: Unraid<ExecutorConfig, Ex>;

  constructor(instance: Unraid<ExecutorConfig, Ex>) {
    this.instance = instance;
  }

  on<Key extends keyof EventTypeSchema>(
    module: Key,
    listener: (value: PropType<EventTypeSchema, Key>) => void
  ): [() => void] {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const moduleHandler = this[`on_${module}`];

    if (!moduleHandler) {
      throw new Error(`Can not find module handler for ${module}`);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const [cancel] = this[`on_${module}`](listener);

    return [() => cancel()];
  }
}
