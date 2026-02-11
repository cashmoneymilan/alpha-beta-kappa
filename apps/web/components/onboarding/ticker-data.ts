// Ticker database with company names and exchanges
// This is a curated list of popular tickers for the search functionality

export interface TickerInfo {
  symbol: string;
  name: string;
  exchange: string;
  type: "stock" | "etf" | "crypto" | "index";
}

export const TICKER_DATABASE: TickerInfo[] = [
  // Tech Giants
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", type: "stock" },
  { symbol: "GOOGL", name: "Alphabet Inc. (Class A)", exchange: "NASDAQ", type: "stock" },
  { symbol: "GOOG", name: "Alphabet Inc. (Class C)", exchange: "NASDAQ", type: "stock" },
  { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "NFLX", name: "Netflix Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", type: "stock" },

  // Semiconductors
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", type: "stock" },
  { symbol: "AMD", name: "Advanced Micro Devices", exchange: "NASDAQ", type: "stock" },
  { symbol: "INTC", name: "Intel Corporation", exchange: "NASDAQ", type: "stock" },
  { symbol: "AVGO", name: "Broadcom Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "QCOM", name: "Qualcomm Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "TSM", name: "Taiwan Semiconductor", exchange: "NYSE", type: "stock" },
  { symbol: "MU", name: "Micron Technology", exchange: "NASDAQ", type: "stock" },
  { symbol: "MRVL", name: "Marvell Technology", exchange: "NASDAQ", type: "stock" },
  { symbol: "ASML", name: "ASML Holding N.V.", exchange: "NASDAQ", type: "stock" },
  { symbol: "LRCX", name: "Lam Research", exchange: "NASDAQ", type: "stock" },
  { symbol: "KLAC", name: "KLA Corporation", exchange: "NASDAQ", type: "stock" },
  { symbol: "AMAT", name: "Applied Materials", exchange: "NASDAQ", type: "stock" },

  // AI/Software
  { symbol: "PLTR", name: "Palantir Technologies", exchange: "NYSE", type: "stock" },
  { symbol: "CRM", name: "Salesforce Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "NOW", name: "ServiceNow Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "SNOW", name: "Snowflake Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "DDOG", name: "Datadog Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "NET", name: "Cloudflare Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "MDB", name: "MongoDB Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "CRWD", name: "CrowdStrike Holdings", exchange: "NASDAQ", type: "stock" },
  { symbol: "ZS", name: "Zscaler Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "PANW", name: "Palo Alto Networks", exchange: "NASDAQ", type: "stock" },

  // Crypto-related
  { symbol: "COIN", name: "Coinbase Global Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "MSTR", name: "MicroStrategy Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "RIOT", name: "Riot Platforms Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "MARA", name: "Marathon Digital", exchange: "NASDAQ", type: "stock" },
  { symbol: "CLSK", name: "CleanSpark Inc.", exchange: "NASDAQ", type: "stock" },

  // Crypto (actual)
  { symbol: "BTC", name: "Bitcoin", exchange: "CRYPTO", type: "crypto" },
  { symbol: "ETH", name: "Ethereum", exchange: "CRYPTO", type: "crypto" },
  { symbol: "SOL", name: "Solana", exchange: "CRYPTO", type: "crypto" },
  { symbol: "BNB", name: "Binance Coin", exchange: "CRYPTO", type: "crypto" },
  { symbol: "XRP", name: "Ripple", exchange: "CRYPTO", type: "crypto" },
  { symbol: "ADA", name: "Cardano", exchange: "CRYPTO", type: "crypto" },
  { symbol: "AVAX", name: "Avalanche", exchange: "CRYPTO", type: "crypto" },
  { symbol: "DOGE", name: "Dogecoin", exchange: "CRYPTO", type: "crypto" },
  { symbol: "DOT", name: "Polkadot", exchange: "CRYPTO", type: "crypto" },
  { symbol: "MATIC", name: "Polygon", exchange: "CRYPTO", type: "crypto" },
  { symbol: "LINK", name: "Chainlink", exchange: "CRYPTO", type: "crypto" },
  { symbol: "UNI", name: "Uniswap", exchange: "CRYPTO", type: "crypto" },
  { symbol: "ATOM", name: "Cosmos", exchange: "CRYPTO", type: "crypto" },
  { symbol: "LTC", name: "Litecoin", exchange: "CRYPTO", type: "crypto" },

  // Financials
  { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE", type: "stock" },
  { symbol: "BAC", name: "Bank of America", exchange: "NYSE", type: "stock" },
  { symbol: "GS", name: "Goldman Sachs", exchange: "NYSE", type: "stock" },
  { symbol: "MS", name: "Morgan Stanley", exchange: "NYSE", type: "stock" },
  { symbol: "WFC", name: "Wells Fargo & Co.", exchange: "NYSE", type: "stock" },
  { symbol: "C", name: "Citigroup Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "V", name: "Visa Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "MA", name: "Mastercard Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "PYPL", name: "PayPal Holdings", exchange: "NASDAQ", type: "stock" },
  { symbol: "SQ", name: "Block Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "SCHW", name: "Charles Schwab", exchange: "NYSE", type: "stock" },
  { symbol: "BLK", name: "BlackRock Inc.", exchange: "NYSE", type: "stock" },

  // Energy
  { symbol: "XOM", name: "Exxon Mobil Corp.", exchange: "NYSE", type: "stock" },
  { symbol: "CVX", name: "Chevron Corporation", exchange: "NYSE", type: "stock" },
  { symbol: "COP", name: "ConocoPhillips", exchange: "NYSE", type: "stock" },
  { symbol: "SLB", name: "Schlumberger N.V.", exchange: "NYSE", type: "stock" },
  { symbol: "OXY", name: "Occidental Petroleum", exchange: "NYSE", type: "stock" },
  { symbol: "DVN", name: "Devon Energy", exchange: "NYSE", type: "stock" },
  { symbol: "EOG", name: "EOG Resources", exchange: "NYSE", type: "stock" },
  { symbol: "HAL", name: "Halliburton Company", exchange: "NYSE", type: "stock" },
  { symbol: "MPC", name: "Marathon Petroleum", exchange: "NYSE", type: "stock" },
  { symbol: "VLO", name: "Valero Energy", exchange: "NYSE", type: "stock" },

  // Nuclear/Uranium
  { symbol: "CCJ", name: "Cameco Corporation", exchange: "NYSE", type: "stock" },
  { symbol: "UEC", name: "Uranium Energy Corp.", exchange: "AMEX", type: "stock" },
  { symbol: "DNN", name: "Denison Mines Corp.", exchange: "AMEX", type: "stock" },
  { symbol: "NXE", name: "NexGen Energy Ltd.", exchange: "NYSE", type: "stock" },
  { symbol: "LEU", name: "Centrus Energy Corp.", exchange: "AMEX", type: "stock" },
  { symbol: "SMR", name: "NuScale Power Corp.", exchange: "NYSE", type: "stock" },
  { symbol: "UUUU", name: "Energy Fuels Inc.", exchange: "AMEX", type: "stock" },

  // Rare Earth/Materials
  { symbol: "MP", name: "MP Materials Corp.", exchange: "NYSE", type: "stock" },
  { symbol: "LAC", name: "Lithium Americas", exchange: "NYSE", type: "stock" },
  { symbol: "ALB", name: "Albemarle Corp.", exchange: "NYSE", type: "stock" },
  { symbol: "LIT", name: "Global X Lithium ETF", exchange: "NYSE", type: "etf" },
  { symbol: "LTHM", name: "Livent Corporation", exchange: "NYSE", type: "stock" },
  { symbol: "SQM", name: "Sociedad Química y Minera", exchange: "NYSE", type: "stock" },

  // Healthcare/Biotech
  { symbol: "LLY", name: "Eli Lilly & Co.", exchange: "NYSE", type: "stock" },
  { symbol: "NVO", name: "Novo Nordisk A/S", exchange: "NYSE", type: "stock" },
  { symbol: "JNJ", name: "Johnson & Johnson", exchange: "NYSE", type: "stock" },
  { symbol: "PFE", name: "Pfizer Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "MRNA", name: "Moderna Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "ABBV", name: "AbbVie Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "AMGN", name: "Amgen Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "BMY", name: "Bristol-Myers Squibb", exchange: "NYSE", type: "stock" },
  { symbol: "GILD", name: "Gilead Sciences", exchange: "NASDAQ", type: "stock" },
  { symbol: "REGN", name: "Regeneron Pharma", exchange: "NASDAQ", type: "stock" },
  { symbol: "VRTX", name: "Vertex Pharmaceuticals", exchange: "NASDAQ", type: "stock" },
  { symbol: "ISRG", name: "Intuitive Surgical", exchange: "NASDAQ", type: "stock" },

  // EV/Clean Energy
  { symbol: "RIVN", name: "Rivian Automotive", exchange: "NASDAQ", type: "stock" },
  { symbol: "LCID", name: "Lucid Group Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "NIO", name: "NIO Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "XPEV", name: "XPeng Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "LI", name: "Li Auto Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "ENPH", name: "Enphase Energy", exchange: "NASDAQ", type: "stock" },
  { symbol: "SEDG", name: "SolarEdge Technologies", exchange: "NASDAQ", type: "stock" },
  { symbol: "FSLR", name: "First Solar Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "RUN", name: "Sunrun Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "PLUG", name: "Plug Power Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "CHPT", name: "ChargePoint Holdings", exchange: "NYSE", type: "stock" },

  // Consumer
  { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "COST", name: "Costco Wholesale", exchange: "NASDAQ", type: "stock" },
  { symbol: "TGT", name: "Target Corporation", exchange: "NYSE", type: "stock" },
  { symbol: "HD", name: "Home Depot Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "LOW", name: "Lowe's Companies", exchange: "NYSE", type: "stock" },
  { symbol: "NKE", name: "Nike Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "SBUX", name: "Starbucks Corp.", exchange: "NASDAQ", type: "stock" },
  { symbol: "MCD", name: "McDonald's Corp.", exchange: "NYSE", type: "stock" },
  { symbol: "DIS", name: "Walt Disney Co.", exchange: "NYSE", type: "stock" },
  { symbol: "KO", name: "Coca-Cola Company", exchange: "NYSE", type: "stock" },
  { symbol: "PEP", name: "PepsiCo Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "PG", name: "Procter & Gamble", exchange: "NYSE", type: "stock" },

  // Industrial/Defense
  { symbol: "BA", name: "Boeing Company", exchange: "NYSE", type: "stock" },
  { symbol: "LMT", name: "Lockheed Martin", exchange: "NYSE", type: "stock" },
  { symbol: "RTX", name: "RTX Corporation", exchange: "NYSE", type: "stock" },
  { symbol: "NOC", name: "Northrop Grumman", exchange: "NYSE", type: "stock" },
  { symbol: "GD", name: "General Dynamics", exchange: "NYSE", type: "stock" },
  { symbol: "CAT", name: "Caterpillar Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "DE", name: "Deere & Company", exchange: "NYSE", type: "stock" },
  { symbol: "UNP", name: "Union Pacific Corp.", exchange: "NYSE", type: "stock" },
  { symbol: "UPS", name: "United Parcel Service", exchange: "NYSE", type: "stock" },
  { symbol: "FDX", name: "FedEx Corporation", exchange: "NYSE", type: "stock" },

  // Telecom
  { symbol: "T", name: "AT&T Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "VZ", name: "Verizon Communications", exchange: "NYSE", type: "stock" },
  { symbol: "TMUS", name: "T-Mobile US Inc.", exchange: "NASDAQ", type: "stock" },

  // REITs
  { symbol: "AMT", name: "American Tower Corp.", exchange: "NYSE", type: "stock" },
  { symbol: "PLD", name: "Prologis Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "CCI", name: "Crown Castle Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "EQIX", name: "Equinix Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "SPG", name: "Simon Property Group", exchange: "NYSE", type: "stock" },
  { symbol: "O", name: "Realty Income Corp.", exchange: "NYSE", type: "stock" },

  // ETFs - Major Indices
  { symbol: "SPY", name: "SPDR S&P 500 ETF", exchange: "NYSE", type: "etf" },
  { symbol: "QQQ", name: "Invesco QQQ Trust (NASDAQ-100)", exchange: "NASDAQ", type: "etf" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", exchange: "NYSE", type: "etf" },
  { symbol: "DIA", name: "SPDR Dow Jones ETF", exchange: "NYSE", type: "etf" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", exchange: "NYSE", type: "etf" },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", exchange: "NYSE", type: "etf" },
  { symbol: "IVV", name: "iShares Core S&P 500 ETF", exchange: "NYSE", type: "etf" },

  // ETFs - Sector
  { symbol: "XLF", name: "Financial Select SPDR", exchange: "NYSE", type: "etf" },
  { symbol: "XLE", name: "Energy Select SPDR", exchange: "NYSE", type: "etf" },
  { symbol: "XLK", name: "Technology Select SPDR", exchange: "NYSE", type: "etf" },
  { symbol: "XLV", name: "Health Care Select SPDR", exchange: "NYSE", type: "etf" },
  { symbol: "XLI", name: "Industrial Select SPDR", exchange: "NYSE", type: "etf" },
  { symbol: "XLY", name: "Consumer Discretionary SPDR", exchange: "NYSE", type: "etf" },
  { symbol: "XLP", name: "Consumer Staples SPDR", exchange: "NYSE", type: "etf" },
  { symbol: "XLU", name: "Utilities Select SPDR", exchange: "NYSE", type: "etf" },
  { symbol: "XLB", name: "Materials Select SPDR", exchange: "NYSE", type: "etf" },
  { symbol: "XLRE", name: "Real Estate Select SPDR", exchange: "NYSE", type: "etf" },
  { symbol: "SMH", name: "VanEck Semiconductor ETF", exchange: "NASDAQ", type: "etf" },
  { symbol: "SOXX", name: "iShares Semiconductor ETF", exchange: "NASDAQ", type: "etf" },

  // ETFs - Bonds/Fixed Income
  { symbol: "TLT", name: "iShares 20+ Year Treasury ETF", exchange: "NASDAQ", type: "etf" },
  { symbol: "IEF", name: "iShares 7-10 Year Treasury ETF", exchange: "NASDAQ", type: "etf" },
  { symbol: "SHY", name: "iShares 1-3 Year Treasury ETF", exchange: "NASDAQ", type: "etf" },
  { symbol: "BND", name: "Vanguard Total Bond Market ETF", exchange: "NASDAQ", type: "etf" },
  { symbol: "LQD", name: "iShares Investment Grade Corp ETF", exchange: "NYSE", type: "etf" },
  { symbol: "HYG", name: "iShares High Yield Corp ETF", exchange: "NYSE", type: "etf" },
  { symbol: "AGG", name: "iShares Core US Aggregate Bond ETF", exchange: "NYSE", type: "etf" },
  { symbol: "TIP", name: "iShares TIPS Bond ETF", exchange: "NYSE", type: "etf" },

  // ETFs - Commodities
  { symbol: "GLD", name: "SPDR Gold Shares", exchange: "NYSE", type: "etf" },
  { symbol: "SLV", name: "iShares Silver Trust", exchange: "NYSE", type: "etf" },
  { symbol: "USO", name: "United States Oil Fund", exchange: "NYSE", type: "etf" },
  { symbol: "UNG", name: "United States Natural Gas Fund", exchange: "NYSE", type: "etf" },
  { symbol: "GDX", name: "VanEck Gold Miners ETF", exchange: "NYSE", type: "etf" },
  { symbol: "GDXJ", name: "VanEck Junior Gold Miners ETF", exchange: "NYSE", type: "etf" },
  { symbol: "COPX", name: "Global X Copper Miners ETF", exchange: "NYSE", type: "etf" },

  // ETFs - International
  { symbol: "EFA", name: "iShares MSCI EAFE ETF", exchange: "NYSE", type: "etf" },
  { symbol: "EEM", name: "iShares MSCI Emerging Markets ETF", exchange: "NYSE", type: "etf" },
  { symbol: "VWO", name: "Vanguard FTSE Emerging Markets ETF", exchange: "NYSE", type: "etf" },
  { symbol: "FXI", name: "iShares China Large-Cap ETF", exchange: "NYSE", type: "etf" },
  { symbol: "KWEB", name: "KraneShares CSI China Internet ETF", exchange: "NYSE", type: "etf" },
  { symbol: "EWJ", name: "iShares MSCI Japan ETF", exchange: "NYSE", type: "etf" },
  { symbol: "EWZ", name: "iShares MSCI Brazil ETF", exchange: "NYSE", type: "etf" },

  // ETFs - Leveraged/Inverse
  { symbol: "TQQQ", name: "ProShares UltraPro QQQ (3x)", exchange: "NASDAQ", type: "etf" },
  { symbol: "SQQQ", name: "ProShares UltraPro Short QQQ (-3x)", exchange: "NASDAQ", type: "etf" },
  { symbol: "SPXU", name: "ProShares UltraPro Short S&P500 (-3x)", exchange: "NYSE", type: "etf" },
  { symbol: "UPRO", name: "ProShares UltraPro S&P500 (3x)", exchange: "NYSE", type: "etf" },
  { symbol: "SOXL", name: "Direxion Semiconductor Bull (3x)", exchange: "NYSE", type: "etf" },
  { symbol: "SOXS", name: "Direxion Semiconductor Bear (-3x)", exchange: "NYSE", type: "etf" },
  { symbol: "UVXY", name: "ProShares Ultra VIX Short-Term", exchange: "CBOE", type: "etf" },
  { symbol: "SVXY", name: "ProShares Short VIX Short-Term", exchange: "CBOE", type: "etf" },

  // Volatility/Other
  { symbol: "VIX", name: "CBOE Volatility Index", exchange: "CBOE", type: "index" },
  { symbol: "DXY", name: "US Dollar Index", exchange: "ICE", type: "index" },

  // Chinese ADRs
  { symbol: "BABA", name: "Alibaba Group", exchange: "NYSE", type: "stock" },
  { symbol: "JD", name: "JD.com Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "PDD", name: "PDD Holdings (Pinduoduo)", exchange: "NASDAQ", type: "stock" },
  { symbol: "BIDU", name: "Baidu Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "NTES", name: "NetEase Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "TCEHY", name: "Tencent Holdings", exchange: "OTC", type: "stock" },

  // Other Popular
  { symbol: "BRK.B", name: "Berkshire Hathaway (Class B)", exchange: "NYSE", type: "stock" },
  { symbol: "BRK.A", name: "Berkshire Hathaway (Class A)", exchange: "NYSE", type: "stock" },
  { symbol: "UNH", name: "UnitedHealth Group", exchange: "NYSE", type: "stock" },
  { symbol: "ORCL", name: "Oracle Corporation", exchange: "NYSE", type: "stock" },
  { symbol: "ADBE", name: "Adobe Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "INTU", name: "Intuit Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "IBM", name: "IBM Corporation", exchange: "NYSE", type: "stock" },
  { symbol: "ACN", name: "Accenture plc", exchange: "NYSE", type: "stock" },
  { symbol: "CSCO", name: "Cisco Systems", exchange: "NASDAQ", type: "stock" },
  { symbol: "TXN", name: "Texas Instruments", exchange: "NASDAQ", type: "stock" },
  { symbol: "UBER", name: "Uber Technologies", exchange: "NYSE", type: "stock" },
  { symbol: "LYFT", name: "Lyft Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "ABNB", name: "Airbnb Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "DASH", name: "DoorDash Inc.", exchange: "NASDAQ", type: "stock" },
  { symbol: "SHOP", name: "Shopify Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "SQ", name: "Block Inc. (Square)", exchange: "NYSE", type: "stock" },
  { symbol: "RBLX", name: "Roblox Corporation", exchange: "NYSE", type: "stock" },
  { symbol: "TTWO", name: "Take-Two Interactive", exchange: "NASDAQ", type: "stock" },
  { symbol: "EA", name: "Electronic Arts", exchange: "NASDAQ", type: "stock" },
  { symbol: "ATVI", name: "Activision Blizzard", exchange: "NASDAQ", type: "stock" },
  { symbol: "GME", name: "GameStop Corp.", exchange: "NYSE", type: "stock" },
  { symbol: "AMC", name: "AMC Entertainment", exchange: "NYSE", type: "stock" },
  { symbol: "HOOD", name: "Robinhood Markets", exchange: "NASDAQ", type: "stock" },
  { symbol: "SOFI", name: "SoFi Technologies", exchange: "NASDAQ", type: "stock" },
  { symbol: "AFRM", name: "Affirm Holdings", exchange: "NASDAQ", type: "stock" },
  { symbol: "PATH", name: "UiPath Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "AI", name: "C3.ai Inc.", exchange: "NYSE", type: "stock" },
  { symbol: "UPST", name: "Upstart Holdings", exchange: "NASDAQ", type: "stock" },
];

// Search function that matches against symbol and company name
export function searchTickers(query: string, limit = 10): TickerInfo[] {
  if (!query || query.length < 1) return [];

  const normalizedQuery = query.toUpperCase().trim();

  // First, find exact symbol matches
  const exactMatches = TICKER_DATABASE.filter(
    (t) => t.symbol === normalizedQuery
  );

  // Then, find tickers that start with the query
  const startsWithSymbol = TICKER_DATABASE.filter(
    (t) => t.symbol.startsWith(normalizedQuery) && t.symbol !== normalizedQuery
  );

  // Then, find tickers where name contains the query
  const nameMatches = TICKER_DATABASE.filter(
    (t) =>
      !t.symbol.startsWith(normalizedQuery) &&
      t.name.toUpperCase().includes(normalizedQuery)
  );

  // Combine and limit results
  return [...exactMatches, ...startsWithSymbol, ...nameMatches].slice(0, limit);
}

// Get ticker info by symbol
export function getTickerInfo(symbol: string): TickerInfo | undefined {
  return TICKER_DATABASE.find((t) => t.symbol === symbol.toUpperCase());
}
