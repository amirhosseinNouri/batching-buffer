import { beforeEach, describe, expect, it, mock } from "bun:test";
import { BatchingBuffer } from "@/lib/batching-buffer";
import { delay } from "@/lib/delay";

type TestEvent = {
	id: string;
};

describe("service => BatchingBuffer", () => {
	const callback = mock();

	beforeEach(() => {
		mock.clearAllMocks();
	});

	it("should flush events when the buffer is full", () => {
		const buffer = new BatchingBuffer<TestEvent>({
			callback,
			maxSize: 2,
		});

		buffer.add({ id: "1" });
		buffer.add({ id: "2" });

		expect(callback).toHaveBeenCalledWith([{ id: "1" }, { id: "2" }]);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(buffer.buffer).toEqual([]);
	});

	it("should not flush events when the buffer is not full", () => {
		const buffer = new BatchingBuffer<TestEvent>({
			callback,
			maxSize: 2,
		});
		buffer.add({ id: "1" });
		expect(callback).not.toHaveBeenCalled();
		expect(callback).toHaveBeenCalledTimes(0);
		expect(buffer.buffer).toEqual([{ id: "1" }]);
	});

	it("should be able to hold events after flush due to max buffer size", () => {
		const buffer = new BatchingBuffer<TestEvent>({
			callback,
			maxSize: 2,
		});
		buffer.add({ id: "1" });
		buffer.add({ id: "2" });
		buffer.add({ id: "3" });
		expect(buffer.buffer).toEqual([{ id: "3" }]);
	});

	it("should enable timeout flushing only when timeout is provided", async () => {
		const timeout = 50;
		const buffer = new BatchingBuffer<TestEvent>({
			callback,
			maxSize: 2,
			timeout,
		});
		buffer.add({ id: "1" });
		expect(callback).not.toHaveBeenCalled();
		await delay(timeout);
		expect(callback).toHaveBeenCalledWith([{ id: "1" }]);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(buffer.buffer).toEqual([]);
	});

	it("should not flush events when the buffer is empty", () => {
		const buffer = new BatchingBuffer<TestEvent>({
			callback,
			maxSize: 2,
		});
		buffer.flush();
		expect(callback).not.toHaveBeenCalled();
	});

	it("should flush events when flush is called", () => {
		const buffer = new BatchingBuffer<TestEvent>({
			callback,
			maxSize: 2,
		});
		buffer.add({ id: "1" });
		buffer.flush();
		expect(callback).toHaveBeenCalledWith([{ id: "1" }]);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(buffer.buffer).toEqual([]);
	});

	it("should clear the timer when the buffer is flushed due to max size", async () => {
		const timeout = 50;
		const buffer = new BatchingBuffer<TestEvent>({
			callback,
			maxSize: 2,
			timeout,
		});
		buffer.add({ id: "1" });
		buffer.add({ id: "2" });
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith([{ id: "1" }, { id: "2" }]);
		await delay(timeout);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(buffer.buffer).toEqual([]);
	});

	it("should work correctly with timeout and maxSize", async () => {
		const timeout = 50;
		const buffer = new BatchingBuffer<TestEvent>({
			callback,
			maxSize: 2,
			timeout,
		});
		// Flush due to timeout
		buffer.add({ id: "1" });
		await delay(timeout);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith([{ id: "1" }]);
		expect(buffer.buffer).toEqual([]);

		// Flush due to maxSize
		buffer.add({ id: "2" });
		buffer.add({ id: "3" });
		expect(callback).toHaveBeenCalledWith([{ id: "2" }, { id: "3" }]);
		expect(callback).toHaveBeenCalledTimes(2);
		expect(buffer.buffer).toEqual([]);
	});
});
