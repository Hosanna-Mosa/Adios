import { ServiceType } from "../../database/models/Order";
import SystemConfig from "../../database/models/SystemConfig";
import { computeHelperQuote, HelperQuote, HelperRates, resolveHelperRates } from "./helper.pricing";

interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  total: number;
}

interface RateConfig {
  baseFare: number;
  perKmRate: number;
  perMinRate: number;
}

const DEFAULT_RATES: Record<ServiceType, RateConfig> = {
  [ServiceType.BIKE]: {
    baseFare: parseFloat(process.env.RATE_BIKE_BASE || "15"),
    perKmRate: parseFloat(process.env.RATE_BIKE_PER_KM || "5"),
    perMinRate: parseFloat(process.env.RATE_BIKE_PER_MIN || "1"),
  },
  [ServiceType.AUTO]: {
    baseFare: parseFloat(process.env.RATE_AUTO_BASE || "25"),
    perKmRate: parseFloat(process.env.RATE_AUTO_PER_KM || "8"),
    perMinRate: parseFloat(process.env.RATE_AUTO_PER_MIN || "2"),
  },
  [ServiceType.CAB]: {
    baseFare: parseFloat(process.env.RATE_CAB_BASE || "50"),
    perKmRate: parseFloat(process.env.RATE_CAB_PER_KM || "12"),
    perMinRate: parseFloat(process.env.RATE_CAB_PER_MIN || "3"),
  },
  [ServiceType.CAB_PRIME]: {
    baseFare: parseFloat(process.env.RATE_CAB_PRIME_BASE || "80"),
    perKmRate: parseFloat(process.env.RATE_CAB_PRIME_PER_KM || "18"),
    perMinRate: parseFloat(process.env.RATE_CAB_PRIME_PER_MIN || "4"),
  },
  [ServiceType.DELIVERY]: {
    baseFare: parseFloat(process.env.RATE_DELIVERY_BASE || "50"),
    perKmRate: parseFloat(process.env.RATE_DELIVERY_PER_KM || "12"),
    perMinRate: parseFloat(process.env.RATE_DELIVERY_PER_MIN || "2"),
  },
  [ServiceType.HELPER]: {
    baseFare: parseFloat(process.env.RATE_HELPER_BASE || "99"),
    perKmRate: parseFloat(process.env.RATE_HELPER_PER_KM || "15"),
    perMinRate: parseFloat(process.env.RATE_HELPER_PER_MIN || "2"),
  },
};

export class PricingService {
  async getRateConfig(serviceType: ServiceType): Promise<RateConfig> {
    try {
      const config = await SystemConfig.findOne({ key: "global_settings" });
      // The admin seed writes upper-case keys (HELPER, CAB_PRIME); ServiceType values are lower-case.
      const rates = config?.value?.rates;
      const saved = rates?.[serviceType] ?? rates?.[String(serviceType).toUpperCase()];
      if (saved) {
        return saved;
      }
    } catch (error) {
      console.error("Error reading system config, using default rates:", error);
    }
    return DEFAULT_RATES[serviceType] || DEFAULT_RATES[ServiceType.CAB];
  }

  /** Helper task rates (admin → Helper pricing) over the defaults. */
  async getHelperRates(): Promise<HelperRates> {
    try {
      const config = await SystemConfig.findOne({ key: "global_settings" }).lean();
      return resolveHelperRates((config as any)?.value?.helperRates);
    } catch (error) {
      console.error("Error reading helper rates, using defaults:", error);
      return resolveHelperRates(undefined);
    }
  }

  async quoteHelper(input: { hours: unknown; distanceKm?: number; surgeMultiplier?: number }): Promise<HelperQuote> {
    return computeHelperQuote(input, await this.getHelperRates());
  }

  async calculateFareBreakdown(
    serviceType: ServiceType,
    distanceInKm: number,
    estimatedMinutes: number = 0,
    surgeMultiplier: number = 1,
  ): Promise<FareBreakdown> {
    const rates = await this.getRateConfig(serviceType);

    const baseFare = rates.baseFare;
    const distanceFare = Math.round(distanceInKm * rates.perKmRate * 100) / 100;
    const timeFare = Math.round(estimatedMinutes * rates.perMinRate * 100) / 100;

    const total = Math.round((baseFare + distanceFare + timeFare) * surgeMultiplier * 100) / 100;

    return { baseFare, distanceFare, timeFare, surgeMultiplier, total };
  }

  // Keep backward compatibility with delivery pricing
  async calculatePrice(distanceInKm: number, stopCount: number, surgeMultiplier: number = 1): Promise<number> {
    const rates = await this.getRateConfig(ServiceType.DELIVERY);
    const distancePrice = distanceInKm * rates.perKmRate;
    const stopPrice = stopCount * 20;
    return Math.round((rates.baseFare + distancePrice + stopPrice) * surgeMultiplier * 100) / 100;
  }
}
