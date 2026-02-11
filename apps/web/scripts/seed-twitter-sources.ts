/**
 * Seed Twitter sources for alpha tracking
 * Run with: npx tsx scripts/seed-twitter-sources.ts
 */

const TWITTER_SOURCES = [
  // Flow/Whale accounts - Real-time options activity
  {
    handle: "unusual_whales",
    name: "Unusual Whales",
    type: "twitter",
    category: "flow",
    weight: 8,
    description: "Options flow alerts, unusual activity detection",
  },
  {
    handle: "caboringer",
    name: "Caboringer",
    type: "twitter",
    category: "flow",
    weight: 7,
    description: "Dark pool prints and institutional flow",
  },
  {
    handle: "optionsfox",
    name: "Options Fox",
    type: "twitter",
    category: "flow",
    weight: 6,
    description: "Options flow scanner and alerts",
  },

  // Research accounts - Deep fundamental analysis
  {
    handle: "borrowed_ideas",
    name: "Borrowed Ideas",
    type: "twitter",
    category: "research",
    weight: 9,
    description: "Deep value research and analysis",
  },
  {
    handle: "10kdiver",
    name: "10-K Diver",
    type: "twitter",
    category: "research",
    weight: 8,
    description: "Fundamental analysis and valuation frameworks",
  },
  {
    handle: "QCompounding",
    name: "Quality Compounders",
    type: "twitter",
    category: "research",
    weight: 7,
    description: "Quality growth company analysis",
  },

  // Breaking news - Speed edge
  {
    handle: "DeItaone",
    name: "Walter Bloomberg",
    type: "twitter",
    category: "breaking",
    weight: 9,
    description: "Fast breaking financial news",
  },
  {
    handle: "FirstSquawk",
    name: "First Squawk",
    type: "twitter",
    category: "breaking",
    weight: 8,
    description: "Real-time market headlines",
  },
  {
    handle: "Fxhedgers",
    name: "FX Hedgers",
    type: "twitter",
    category: "breaking",
    weight: 7,
    description: "Macro headlines and FX news",
  },

  // Sector specialists
  {
    handle: "SemiAnalysis",
    name: "SemiAnalysis",
    type: "twitter",
    category: "sector",
    weight: 9,
    description: "Semiconductor industry deep dives",
  },
  {
    handle: "EnergyCredit",
    name: "Energy Credit",
    type: "twitter",
    category: "sector",
    weight: 7,
    description: "Energy sector analysis",
  },

  // Macro/Fed watchers
  {
    handle: "MacroAlf",
    name: "Macro Alf",
    type: "twitter",
    category: "macro",
    weight: 8,
    description: "Macro analysis and positioning",
  },
  {
    handle: "FedGuy12",
    name: "Joseph Wang",
    type: "twitter",
    category: "macro",
    weight: 9,
    description: "Fed policy and liquidity analysis",
  },

  // Quant/Data
  {
    handle: "modaboratory",
    name: "Moda Laboratory",
    type: "twitter",
    category: "quant",
    weight: 7,
    description: "Quantitative analysis and backtests",
  },

  // Contrarian/Fade signals
  {
    handle: "jimcramer",
    name: "Jim Cramer",
    type: "twitter",
    category: "contrarian",
    weight: 5,
    description: "Inverse Cramer signal (contrarian indicator)",
  },
];

async function seedSources() {
  const baseUrl = process.env.API_URL || "http://localhost:3002";
  const skipCategory = process.argv.includes("--no-category");

  console.log("Seeding Twitter sources...\n");
  if (skipCategory) {
    console.log("(Skipping category field - run migration first)\n");
  }

  for (const source of TWITTER_SOURCES) {
    try {
      const payload = skipCategory
        ? { handle: source.handle, name: source.name, type: source.type, weight: source.weight }
        : source;

      const response = await fetch(`${baseUrl}/api/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✓ Added: @${source.handle} (${source.category})`);
      } else if (response.status === 409) {
        console.log(`- Exists: @${source.handle}`);
      } else {
        console.log(`✗ Failed: @${source.handle} - ${data.error}`);
      }
    } catch (error) {
      console.log(`✗ Error: @${source.handle} - ${error}`);
    }
  }

  console.log("\nDone!");
}

seedSources();
