import type { BatchingBufferConfig } from "@/types";

class BatchingBuffer<TEvent> {
	private _buffer: TEvent[] = [];
	private timer: ReturnType<typeof setTimeout> | null = null;
	private config: BatchingBufferConfig<TEvent>;

	constructor(config: BatchingBufferConfig<TEvent>) {
		this.config = config;
	}

	get buffer() {
		return this._buffer;
	}

	add(item: TEvent) {
		this.buffer.push(item);
		if (this.buffer.length >= this.config.maxSize) {
			this.flush();
			return;
		}

		if (!this.timer && this.config.timeout) {
			this.timer = null;
			this.timer = setTimeout(() => this.flush(), this.config.timeout);
		}
	}

	flush() {
		if (this._buffer.length === 0) {
			return;
		}
		this.config.callback(this.buffer);
		this._buffer = [];
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
	}
}
export { BatchingBuffer };
