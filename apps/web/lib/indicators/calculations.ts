import type { UTCTimestamp } from 'lightweight-charts';
import type { Bar } from '@/types/trading';
import type {
  IndicatorDataPoint,
  BollingerBandsData,
  MACDData,
  VolumeDataPoint,
} from '@/types/indicators';

/**
 * Convert bar timestamp (ms) to Lightweight Charts UTCTimestamp (seconds)
 */
function toChartTime(timestamp: number): UTCTimestamp {
  return (timestamp / 1000) as UTCTimestamp;
}

/**
 * Simple Moving Average (SMA)
 * Average of closing prices over a specified period
 */
export function calculateSMA(bars: Bar[], period: number): IndicatorDataPoint[] {
  if (bars.length < period) return [];

  const result: IndicatorDataPoint[] = [];

  for (let i = period - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      const bar = bars[i - j];
      if (bar) sum += bar.close;
    }
    const currentBar = bars[i];
    if (currentBar) {
      result.push({
        time: toChartTime(currentBar.timestamp),
        value: sum / period,
      });
    }
  }

  return result;
}

/**
 * Exponential Moving Average (EMA)
 * Weighted average giving more importance to recent prices
 */
export function calculateEMA(bars: Bar[], period: number): IndicatorDataPoint[] {
  if (bars.length < period) return [];

  const result: IndicatorDataPoint[] = [];
  const multiplier = 2 / (period + 1);

  // First EMA value is the SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    const bar = bars[i];
    if (bar) sum += bar.close;
  }
  let ema = sum / period;
  const firstBar = bars[period - 1];
  if (firstBar) {
    result.push({
      time: toChartTime(firstBar.timestamp),
      value: ema,
    });
  }

  // Calculate subsequent EMA values
  for (let i = period; i < bars.length; i++) {
    const bar = bars[i];
    if (bar) {
      ema = (bar.close - ema) * multiplier + ema;
      result.push({
        time: toChartTime(bar.timestamp),
        value: ema,
      });
    }
  }

  return result;
}

/**
 * Bollinger Bands
 * Upper/lower bands based on standard deviation from SMA
 */
export function calculateBollingerBands(
  bars: Bar[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerBandsData {
  if (bars.length < period) {
    return { upper: [], middle: [], lower: [] };
  }

  const upper: IndicatorDataPoint[] = [];
  const middle: IndicatorDataPoint[] = [];
  const lower: IndicatorDataPoint[] = [];

  for (let i = period - 1; i < bars.length; i++) {
    // Calculate SMA
    let sum = 0;
    for (let j = 0; j < period; j++) {
      const bar = bars[i - j];
      if (bar) sum += bar.close;
    }
    const sma = sum / period;

    // Calculate standard deviation
    let squaredDiffSum = 0;
    for (let j = 0; j < period; j++) {
      const bar = bars[i - j];
      if (bar) {
        const diff = bar.close - sma;
        squaredDiffSum += diff * diff;
      }
    }
    const stdDev = Math.sqrt(squaredDiffSum / period);

    const currentBar = bars[i];
    if (currentBar) {
      const time = toChartTime(currentBar.timestamp);
      middle.push({ time, value: sma });
      upper.push({ time, value: sma + stdDevMultiplier * stdDev });
      lower.push({ time, value: sma - stdDevMultiplier * stdDev });
    }
  }

  return { upper, middle, lower };
}

/**
 * Volume Weighted Average Price (VWAP)
 * Cumulative (price * volume) / cumulative volume
 */
export function calculateVWAP(bars: Bar[]): IndicatorDataPoint[] {
  if (bars.length === 0) return [];

  const result: IndicatorDataPoint[] = [];
  let cumulativeTPV = 0; // Typical Price * Volume
  let cumulativeVolume = 0;

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    if (bar) {
      const typicalPrice = (bar.high + bar.low + bar.close) / 3;
      cumulativeTPV += typicalPrice * bar.volume;
      cumulativeVolume += bar.volume;

      const vwap = cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : typicalPrice;

      result.push({
        time: toChartTime(bar.timestamp),
        value: vwap,
      });
    }
  }

  return result;
}

/**
 * Relative Strength Index (RSI)
 * Momentum oscillator measuring speed and magnitude of price changes
 */
export function calculateRSI(bars: Bar[], period: number = 14): IndicatorDataPoint[] {
  if (bars.length < period + 1) return [];

  const result: IndicatorDataPoint[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < bars.length; i++) {
    const bar = bars[i];
    const prevBar = bars[i - 1];
    if (bar && prevBar) {
      const change = bar.close - prevBar.close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
  }

  // Calculate first average gain and loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // First RSI value
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - 100 / (1 + rs);
  const firstBar = bars[period];
  if (firstBar) {
    result.push({
      time: toChartTime(firstBar.timestamp),
      value: rsi,
    });
  }

  // Calculate subsequent RSI values using smoothed averages
  for (let i = period; i < gains.length; i++) {
    const gain = gains[i];
    const loss = losses[i];
    if (gain !== undefined && loss !== undefined) {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi = 100 - 100 / (1 + rs);

      const bar = bars[i + 1];
      if (bar) {
        result.push({
          time: toChartTime(bar.timestamp),
          value: rsi,
        });
      }
    }
  }

  return result;
}

/**
 * Moving Average Convergence Divergence (MACD)
 * Trend-following momentum indicator
 */
export function calculateMACD(
  bars: Bar[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDData {
  if (bars.length < slowPeriod + signalPeriod) {
    return { macd: [], signal: [], histogram: [] };
  }

  // Calculate EMAs
  const fastEMA = calculateEMA(bars, fastPeriod);
  const slowEMA = calculateEMA(bars, slowPeriod);

  // Calculate MACD line (fast EMA - slow EMA)
  const macdLine: IndicatorDataPoint[] = [];
  const slowStart = slowPeriod - fastPeriod;

  for (let i = 0; i < slowEMA.length; i++) {
    const fastValue = fastEMA[i + slowStart];
    const slowValue = slowEMA[i];
    if (fastValue && slowValue) {
      macdLine.push({
        time: slowValue.time,
        value: fastValue.value - slowValue.value,
      });
    }
  }

  // Calculate signal line (EMA of MACD)
  const signalLine: IndicatorDataPoint[] = [];
  if (macdLine.length >= signalPeriod) {
    const multiplier = 2 / (signalPeriod + 1);

    // First signal is SMA of MACD
    let sum = 0;
    for (let i = 0; i < signalPeriod; i++) {
      const point = macdLine[i];
      if (point) sum += point.value;
    }
    let signal = sum / signalPeriod;
    const firstPoint = macdLine[signalPeriod - 1];
    if (firstPoint) {
      signalLine.push({
        time: firstPoint.time,
        value: signal,
      });
    }

    // Calculate subsequent signal values
    for (let i = signalPeriod; i < macdLine.length; i++) {
      const point = macdLine[i];
      if (point) {
        signal = (point.value - signal) * multiplier + signal;
        signalLine.push({
          time: point.time,
          value: signal,
        });
      }
    }
  }

  // Calculate histogram (MACD - Signal)
  const histogram: IndicatorDataPoint[] = [];
  const macdStart = signalPeriod - 1;

  for (let i = 0; i < signalLine.length; i++) {
    const signalPoint = signalLine[i];
    const macdPoint = macdLine[i + macdStart];
    if (signalPoint && macdPoint) {
      histogram.push({
        time: signalPoint.time,
        value: macdPoint.value - signalPoint.value,
      });
    }
  }

  // Trim MACD line to match histogram length
  const trimmedMACD = macdLine.slice(macdStart);

  return {
    macd: trimmedMACD,
    signal: signalLine,
    histogram,
  };
}

/**
 * Volume with color based on price direction
 */
export function calculateVolume(
  bars: Bar[],
  upColor: string = '#22c55e',
  downColor: string = '#ef4444'
): VolumeDataPoint[] {
  return bars.map((bar, i) => {
    const prevBar = bars[i - 1];
    const isUp = i === 0 || !prevBar || bar.close >= prevBar.close;
    return {
      time: toChartTime(bar.timestamp),
      value: bar.volume,
      color: isUp ? upColor : downColor,
    };
  });
}
