import type { WipData } from 'pg-boss';

export interface OnQueueWipEventHandler {
  onWip(workers: WipData[]): Promise<void> | void;
}
export interface OnQueueErrorEventHandler {
  onError(error: Error): Promise<void>;
}
export interface OnQueueStopEventHandler {
  onStop(): Promise<void>;
}

export type QueueEvent = 'error' | 'wip' | 'stopped' | 'maintenance';
