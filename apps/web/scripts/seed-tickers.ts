/**
 * Seed tickers table with financial symbols for ticker extraction
 * Run with: npx tsx scripts/seed-tickers.ts
 */

const TICKERS = [
  // Tech
  { symbol: "NVDA", name: "NVIDIA Corporation", asset_class: "equities", aliases: ["nvidia"] },
  { symbol: "AMD", name: "Advanced Micro Devices", asset_class: "equities", aliases: ["amd"] },
  { symbol: "AVGO", name: "Broadcom Inc", asset_class: "equities", aliases: ["broadcom"] },
  { symbol: "AAPL", name: "Apple Inc", asset_class: "equities", aliases: ["apple"] },
  { symbol: "MSFT", name: "Microsoft Corporation", asset_class: "equities", aliases: ["microsoft"] },
  { symbol: "GOOGL", name: "Alphabet Inc", asset_class: "equities", aliases: ["google", "alphabet"] },
  { symbol: "AMZN", name: "Amazon.com Inc", asset_class: "equities", aliases: ["amazon"] },
  { symbol: "META", name: "Meta Platforms", asset_class: "equities", aliases: ["meta", "facebook"] },
  { symbol: "TSLA", name: "Tesla Inc", asset_class: "equities", aliases: ["tesla"] },
  // Indexes/ETFs
  { symbol: "SPY", name: "S&P 500 ETF", asset_class: "equities", aliases: ["spx", "s&p", "sp500"] },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", asset_class: "equities", aliases: ["nasdaq", "qqq"] },
  { symbol: "IWM", name: "Russell 2000 ETF", asset_class: "equities", aliases: ["russell"] },
  { symbol: "DIA", name: "Dow Jones ETF", asset_class: "equities", aliases: ["dow"] },
  // Bonds/Macro
  { symbol: "TLT", name: "Treasury Bond ETF", asset_class: "macro", aliases: ["treasuries", "bonds", "long bonds"] },
  { symbol: "HYG", name: "High Yield Bond ETF", asset_class: "macro", aliases: ["junk bonds", "high yield"] },
  { symbol: "LQD", name: "Investment Grade Bond ETF", asset_class: "macro", aliases: ["ig bonds"] },
  // Uranium
  { symbol: "CCJ", name: "Cameco Corporation", asset_class: "equities", aliases: ["cameco", "uranium"] },
  { symbol: "UEC", name: "Uranium Energy Corp", asset_class: "equities", aliases: [] },
  { symbol: "UUUU", name: "Energy Fuels", asset_class: "equities", aliases: ["energy fuels"] },
  { symbol: "DNN", name: "Denison Mines", asset_class: "equities", aliases: ["denison"] },
  // Metals
  { symbol: "GLD", name: "Gold ETF", asset_class: "metals", aliases: ["gold"] },
  { symbol: "SLV", name: "Silver ETF", asset_class: "metals", aliases: ["silver"] },
  { symbol: "NEM", name: "Newmont Corporation", asset_class: "metals", aliases: ["newmont"] },
  { symbol: "GOLD", name: "Barrick Gold", asset_class: "metals", aliases: ["barrick"] },
  { symbol: "MP", name: "MP Materials", asset_class: "metals", aliases: ["rare earth", "ree"] },
  // Crypto
  { symbol: "BTC", name: "Bitcoin", asset_class: "crypto", aliases: ["bitcoin"] },
  { symbol: "ETH", name: "Ethereum", asset_class: "crypto", aliases: ["ethereum", "ether"] },
  { symbol: "SOL", name: "Solana", asset_class: "crypto", aliases: ["solana"] },
  // Oil/Energy
  { symbol: "XLE", name: "Energy Sector ETF", asset_class: "commodities", aliases: ["energy"] },
  { symbol: "USO", name: "Oil ETF", asset_class: "commodities", aliases: ["oil", "crude"] },
  { symbol: "XOP", name: "Oil & Gas Exploration ETF", asset_class: "commodities", aliases: ["oil gas"] },
];

async function seedTickers() {
  const baseUrl = process.env.API_URL || "http://localhost:3002";

  console.log("Seeding tickers...\n");

  let added = 0;
  let exists = 0;
  let failed = 0;

  for (const ticker of TICKERS) {
    try {
      const response = await fetch(`${baseUrl}/api/tickers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticker),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✓ Added: ${ticker.symbol} - ${ticker.name}`);
        added++;
      } else if (response.status === 409) {
        console.log(`- Exists: ${ticker.symbol}`);
        exists++;
      } else {
        console.log(`✗ Failed: ${ticker.symbol} - ${data.error}`);
        failed++;
      }
    } catch (error) {
      console.log(`✗ Error: ${ticker.symbol} - ${error}`);
      failed++;
    }
  }

  console.log(`\nDone! Added: ${added}, Already existed: ${exists}, Failed: ${failed}`);
  console.log("\nTo re-ingest feeds with ticker extraction, run:");
  console.log("  curl -X POST http://localhost:3002/api/ingest/rss -H 'Content-Type: application/json' -d '{\"manual\":true}'");
}

seedTickers();
