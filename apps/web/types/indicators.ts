import type { UTCTimestamp } from 'lightweight-charts';

export interface IndicatorDataPoint {
  time: UTCTimestamp;
  value: number;
}

export interface BollingerBandsData {
  upper: IndicatorDataPoint[];
  middle: IndicatorDataPoint[];
  lower: IndicatorDataPoint[];
}

export interface MACDData {
  macd: IndicatorDataPoint[];
  signal: IndicatorDataPoint[];
  histogram: IndicatorDataPoint[];
}

export interface VolumeDataPoint {
  time: UTCTimestamp;
  value: number;
  color: string;
}

export interface SMASettings {
  enabled: boolean;
  periods: number[];
  colors: string[];
}

export interface EMASettings {
  enabled: boolean;
  periods: number[];
  colors: string[];
}

export interface BollingerSettings {
  enabled: boolean;
  period: number;
  stdDev: number;
  color: string;
}

export interface VWAPSettings {
  enabled: boolean;
  color: string;
}

export interface RSISettings {
  enabled: boolean;
  period: number;
  color: string;
  overbought: number;
  oversold: number;
}

export interface MACDSettings {
  enabled: boolean;
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
  colors: {
    macd: string;
    signal: string;
    histogramUp: string;
    histogramDown: string;
  };
}

export interface VolumeSettings {
  enabled: boolean;
  colors: {
    up: string;
    down: string;
  };
}

export interface IndicatorSettings {
  sma: SMASettings;
  ema: EMASettings;
  bollinger: BollingerSettings;
  vwap: VWAPSettings;
  rsi: RSISettings;
  macd: MACDSettings;
  volume: VolumeSettings;
}

export const defaultIndicatorSettings: IndicatorSettings = {
  sma: {
    enabled: false,
    periods: [20, 50],
    colors: ['#f59e0b', '#3b82f6'],
  },
  ema: {
    enabled: false,
    periods: [12, 26],
    colors: ['#8b5cf6', '#ec4899'],
  },
  bollinger: {
    enabled: false,
    period: 20,
    stdDev: 2,
    color: '#06b6d4',
  },
  vwap: {
    enabled: false,
    color: '#f97316',
  },
  rsi: {
    enabled: false,
    period: 14,
    color: '#a855f7',
    overbought: 70,
    oversold: 30,
  },
  macd: {
    enabled: false,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    colors: {
      macd: '#3b82f6',
      signal: '#ef4444',
      histogramUp: '#22c55e',
      histogramDown: '#ef4444',
    },
  },
  volume: {
    enabled: true,
    colors: {
      up: '#22c55e',
      down: '#ef4444',
    },
  },
};
