/**
 * ToolLok Institutional Quantitative Engine
 * Black-Scholes Model & Option Greeks Calculations
 */

export type OptionType = "Call" | "Put";
export type PositionType = "Long" | "Short";

export interface OptionGreeks {
     price: number;
     delta: number;
     gamma: number;
     theta: number;
     vega: number;
}

/**
 * Strategy Leg Interface for Payoff Visualizer
 */
export interface PayoffLeg {
     position: PositionType;
     type: OptionType;
     strike: number;
     premium: number;
     quantity: number;
}

/**
 * Standard Normal Cumulative Distribution Function (CDF)
 */
export function normalCDF(x: number): number {
     const t = 1 / (1 + 0.2316419 * Math.abs(x));
     const d = 0.3989423 * Math.exp(-x * x / 2);
     const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
     return x > 0 ? 1 - prob : prob;
}

/**
 * Standard Normal Probability Density Function (PDF)
 */
export function normalPDF(x: number): number {
     return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Black-Scholes Option Pricing and Greeks Engine
 * @param S Current Spot Price of Underlying
 * @param K Strike Price
 * @param T Time to Expiration in Years (e.g., 30 days = 30/365)
 * @param r Risk-Free Interest Rate (decimal, e.g., 0.07 for 7%)
 * @param v Implied Volatility (decimal, e.g., 0.15 for 15% IV)
 * @param type "Call" | "Put"
 */
export function calculateBlackScholesGreeks(
     S: number,
     K: number,
     T: number,
     r: number,
     v: number,
     type: OptionType
): OptionGreeks {
     if (T <= 0 || v <= 0) {
          const intrinsic = type === "Call" ? Math.max(0, S - K) : Math.max(0, K - S);
          return { price: intrinsic, delta: type === "Call" ? (S > K ? 1 : 0) : (S < K ? -1 : 0), gamma: 0, theta: 0, vega: 0 };
     }

     const d1 = (Math.log(S / K) + (r + (v * v) / 2) * T) / (v * Math.sqrt(T));
     const d2 = d1 - v * Math.sqrt(T);

     const Nd1 = normalCDF(d1);
     const Nd2 = normalCDF(d2);
     const pdfD1 = normalPDF(d1);

     let price = 0;
     let delta = 0;

     if (type === "Call") {
          price = S * Nd1 - K * Math.exp(-r * T) * Nd2;
          delta = Nd1;
     } else {
          price = K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
          delta = Nd1 - 1;
     }

     // Gamma is identical for Calls and Puts
     const gamma = pdfD1 / (S * v * Math.sqrt(T));

     // Theta calculation (daily rate)
     let theta = 0;
     if (type === "Call") {
          theta = (- (S * pdfD1 * v) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * Nd2) / 365;
     } else {
          theta = (- (S * pdfD1 * v) / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * normalCDF(-d2)) / 365;
     }

     // Vega calculation (1% change in IV)
     const vega = (S * Math.sqrt(T) * pdfD1) / 100;

     return {
          price: Number(price.toFixed(2)),
          delta: Number(delta.toFixed(4)),
          gamma: Number(gamma.toFixed(6)),
          theta: Number(theta.toFixed(2)),
          vega: Number(vega.toFixed(2))
     };
}