export type MicroserviceEventType =
  | 'ORDER_PLACED'
  | 'ORDER_STATUS_UPDATED'
  | 'SHIPMENT_CREATED'
  | 'SHIPMENT_STAGE_UPDATED'
  | 'RETURN_REQUESTED'
  | 'REFUND_PROCESSED';

export interface MicroserviceEvent<T = any> {
  id: string;
  type: MicroserviceEventType;
  sourceService: string;
  targetService?: string;
  timestamp: string;
  payload: T;
}

type EventHandler<T = any> = (event: MicroserviceEvent<T>) => void;

class InProcessEventBus {
  private handlers: Map<MicroserviceEventType, EventHandler[]> = new Map();
  private eventLog: MicroserviceEvent[] = [];
  private maxLogs: number = 100;

  public subscribe<T>(eventType: MicroserviceEventType, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  public publish<T>(
    type: MicroserviceEventType,
    sourceService: string,
    payload: T,
    targetService?: string
  ): MicroserviceEvent<T> {
    const event: MicroserviceEvent<T> = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      sourceService,
      targetService,
      timestamp: new Date().toISOString(),
      payload,
    };

    // Store in circular log for architecture monitoring
    this.eventLog.unshift(event);
    if (this.eventLog.length > this.maxLogs) {
      this.eventLog.pop();
    }

    const listeners = this.handlers.get(type) || [];
    listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error(`[EventBus] Error in handler for ${type}:`, err);
      }
    });

    return event;
  }

  public getRecentEvents(): MicroserviceEvent[] {
    return [...this.eventLog];
  }
}

export const eventBus = new InProcessEventBus();
