type Backlog = () => void;

type Result<ReturnValue> = {
    error?: unknown;
    returnValue?: ReturnValue;
};

export class CommandQueue {
    private backlog: Backlog[] = [];

    private activeTasks = 0;

    private readonly maxConcurrent: number;

    constructor(maxConcurrent = 6) {
        this.maxConcurrent = maxConcurrent;
    }

    async doTask<ResultValue>(runTask: () => Promise<ResultValue>) {
        if (this.activeTasks >= this.maxConcurrent) {
            await new Promise<void>((resolve) => {
                this.backlog.push(() => resolve());
            });
        }
        this.activeTasks++;
        let result: Result<ResultValue>;
        try {
            result = {
                returnValue: await runTask(),
            };
        } catch (e) {
            result = {
                error: e,
            };
        }
        if (this.backlog.length > 0) {
            this.backlog.shift()();
        }
        this.activeTasks--;
        if (result.error) {
            throw result.error;
        } else {
            return result.returnValue;
        }
    }
}
