import { PaymentProvider } from "./types";
import { RazorpayProvider } from "./razorpay";
import { UPIProvider } from "./upi";
import { PayhipProvider } from "./payhip";
import { MockSimulatorProvider } from "./mock";

class ProviderRegistry {
  private providers: Map<string, PaymentProvider> = new Map();

  constructor() {
    this.register(new MockSimulatorProvider());
    this.register(new UPIProvider());
    this.register(new RazorpayProvider());
    this.register(new PayhipProvider());
  }

  register(provider: PaymentProvider) {
    this.providers.set(provider.id.toLowerCase(), provider);
  }

  get(providerId?: string): PaymentProvider {
    const activeId = (providerId || process.env.PAYMENT_PROVIDER || "mock").toLowerCase();
    const provider = this.providers.get(activeId);
    if (!provider) {
      console.warn(`Provider '${activeId}' not found. Falling back to MockSimulatorProvider.`);
      return this.providers.get("mock")!;
    }
    return provider;
  }

  list(): Array<{ id: string; name: string; isConfigured: boolean }> {
    const list: Array<{ id: string; name: string; isConfigured: boolean }> = [];
    for (const p of this.providers.values()) {
      let isConfigured = true;
      if (p.id === "razorpay") {
        isConfigured = Boolean(process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes("placeholder"));
      } else if (p.id === "payhip") {
        isConfigured = Boolean(process.env.PAYHIP_API_KEY);
      }
      list.push({ id: p.id, name: p.name, isConfigured });
    }
    return list;
  }
}

export const providerFactory = new ProviderRegistry();
export * from "./types";
