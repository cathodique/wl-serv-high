export declare class DoubleBuffer<T> {
    current: T;
    cached: T;
    pending: T;
    constructor(v: T);
}
