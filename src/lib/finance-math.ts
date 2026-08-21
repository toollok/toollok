// lib/finance-math.ts

export type OptionType = "Call" | "Put";
export type PositionType = "Long" | "Short";

export interface PayoffLeg {
     position: PositionType;
     type: OptionType;
     strike: number;
     premium: number;
     quantity: number;
}

// Standard Normal cumulative distribution function (CDF)
function normalCDF(x: number): number {
     const t = 1 / (1 + 0.2316419 * Math.abs(x));
     const d = 0.3989423 * Math.exp(-x * x / 2);
     const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
     return x > 0 ? 1 - prob : prob;
}

// Standard Normal probability density function (PDF)
function normalPDF(x: number): number {
     return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

export function calculateBlackScholesGreeks(
     S: number, // Spot Price
     K: number, // Strike Price
     T: number, // Time to Expiry (in years)
     r: number, // Risk-free rate (e.g., 0.07 for 7%)
     v: number, // Implied Volatility (e.g., 0.15 for 15%)
     type: OptionType
) {
     // Handle 0 DTE edge case to prevent division by zero
     const time = Math.max(T, 0.0001);

     const d1 = (Math.log(S / K) + (r + (v * v) / 2) * time) / (v * Math.sqrt(time));
     const d2 = d1 - v * Math.sqrt(time);

     const nd1 = normalCDF(d1);
     const nd2 = normalCDF(d2);
     const n_d1 = normalCDF(-d1);
     const n_d2 = normalCDF(-d2);
     const pdf_d1 = normalPDF(d1);

     let price = 0;
     let delta = 0;
     let theta = 0;

     // Gamma and Vega are the same for both Calls and Puts
     const gamma = pdf_d1 / (S * v * Math.sqrt(time));
     const vega = (S * pdf_d1 * Math.sqrt(time)) / 100; // Divided by 100 for 1% change

     if (type === "Call") {
          price = S * nd1 - K * Math.exp(-r * time) * nd2;
          delta = nd1;
          // Theta per day
          theta = ((-S * pdf_d1 * v) / (2 * Math.sqrt(time)) - r * K * Math.exp(-r * time) * nd2) / 365;
     } else {
          price = K * Math.exp(-r * time) * n_d2 - S * n_d1;
          delta = nd1 - 1;
          // Theta per day
          theta = ((-S * pdf_d1 * v) / (2 * Math.sqrt(time)) + r * K * Math.exp(-r * time) * n_d2) / 365;
     }

     // Probability of expiring ITM (simplified estimation using d2)
     const probITM = type === "Call" ? normalCDF(d2) * 100 : normalCDF(-d2) * 100;

     return {
          price,
          delta,
          gamma,
          theta,
          vega,
          probITM
     };
}