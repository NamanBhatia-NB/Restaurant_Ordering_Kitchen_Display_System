// Real-time Event Bus for Order Updates and Kitchen Display Sync

type EventCallback = (data: any) => void;

class RealtimeEventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  public subscribe(channel: string, callback: EventCallback): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(callback);

    // Return unsubscribe function
    return () => {
      const channelListeners = this.listeners.get(channel);
      if (channelListeners) {
        channelListeners.delete(callback);
        if (channelListeners.size === 0) {
          this.listeners.delete(channel);
        }
      }
    };
  }

  public emit(channel: string, data: any): void {
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error("Error in event listener callback:", err);
        }
      });
    }

    // Also notify global wildcard listeners
    const globalListeners = this.listeners.get("*");
    if (globalListeners && channel !== "*") {
      globalListeners.forEach((callback) => {
        try {
          callback({ channel, data });
        } catch (err) {
          console.error("Error in wildcard listener callback:", err);
        }
      });
    }
  }
}

// Global singleton instance
const globalForEvents = globalThis as unknown as { eventBus: RealtimeEventBus };
export const appEventBus = globalForEvents.eventBus || new RealtimeEventBus();
if (process.env.NODE_ENV !== "production") globalForEvents.eventBus = appEventBus;
