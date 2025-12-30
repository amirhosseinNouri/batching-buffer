type BatchingBufferConfig<TEvent> = {
	maxSize: number;
	timeout?: number;
	callback: (events: TEvent[]) => unknown;
};

export type { BatchingBufferConfig };
