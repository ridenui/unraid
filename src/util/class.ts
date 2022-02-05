export interface Type<T> extends Function {
  new (...args: any[]): T;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type Constructor = new (...args: any[]) => {};

export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
