/** Short general + role-wise interview tips. */

interface RoleTips {
  dos: string[];
  donts: string[];
}

export const GENERAL_TIPS: RoleTips = {
  dos: [
    "Structure answers: situation → action → result.",
    "Quantify impact wherever you can (%, ₹, timelines).",
    "Prepare 2–3 questions to ask the interviewer.",
  ],
  donts: [
    "Don't bluff — say what you don't know and how you'd find out.",
    "Don't badmouth previous employers or teams.",
    "Don't ramble — land your main point in the first 30 seconds.",
  ],
};

const BY_ROLE: Record<string, RoleTips> = {
  "Financial Analyst": {
    dos: [
      "Walk any P&L or variance answer: volume → mix → price → one-offs.",
      "Know your three statements cold and how they link.",
      "Bring one Excel/modeling example with numbers.",
    ],
    donts: [
      "Don't confuse cash flow with profit.",
      "Don't cite ratios without saying what drives them.",
      "Don't skip the 'so what' — always end with the business implication.",
    ],
  },
  "Investment Banking Analyst": {
    dos: [
      "Know valuation trio: DCF, comps, precedent transactions.",
      "Have a live deal/market view with an opinion.",
      "Show stamina stories — banking interviews probe work ethic.",
    ],
    donts: [
      "Don't fumble 'walk me through a DCF'.",
      "Don't be vague about why banking.",
      "Don't ignore accounting fundamentals.",
    ],
  },
  "Marketing Analyst": {
    dos: [
      "Talk funnels: acquisition → activation → retention, with metrics.",
      "Bring one campaign teardown: what worked, what you'd change.",
      "Know CAC, LTV and basic attribution.",
    ],
    donts: [
      "Don't confuse vanity metrics with revenue impact.",
      "Don't trash a brand's marketing without a better plan.",
      "Don't skip the customer insight behind the numbers.",
    ],
  },
  "Business Analyst": {
    dos: [
      "Frame problems before solutions: users, pain, constraints.",
      "Show one process improvement with before/after metrics.",
      "Know basic SQL/Excel and when each fits.",
    ],
    donts: [
      "Don't jump to dashboards before defining the question.",
      "Don't hide behind jargon — explain trade-offs plainly.",
      "Don't forget stakeholders: who decides, who is affected.",
    ],
  },
  "Data Analyst": {
    dos: [
      "Explain one end-to-end analysis: question → data → method → decision.",
      "Know joins, aggregations and handling nulls/duplicates.",
      "Show a visualization choice you defended.",
    ],
    donts: [
      "Don't report numbers without sanity checks.",
      "Don't confuse correlation with causation.",
      "Don't say 'the data speaks for itself' — it doesn't.",
    ],
  },
  "Product Manager": {
    dos: [
      "Think user → problem → solution → metrics, in that order.",
      "Have a favorite product teardown ready.",
      "Show prioritization with a framework (RICE, MoSCoW).",
    ],
    donts: [
      "Don't build features before naming the user pain.",
      "Don't dodge trade-off questions.",
      "Don't claim solo credit for team launches.",
    ],
  },
  Consultant: {
    dos: [
      "Structure everything: issue trees, MECE buckets, 30-second headlines.",
      "Prepare 2–3 case reps with clear recommendations.",
      "Show comfort with ambiguity and 80/20 analysis.",
    ],
    donts: [
      "Don't ask for data without saying what you'd do with it.",
      "Don't present findings without a recommendation.",
      "Don't freeze on mental math — talk through it.",
    ],
  },
  "Software Engineer": {
    dos: [
      "Narrate your DSA approach before coding: brute force → optimize.",
      "Know time/space complexity of everything you write.",
      "Have a debugging war story with a systematic method.",
    ],
    donts: [
      "Don't go silent while coding — think out loud.",
      "Don't skip tests and edge cases.",
      "Don't claim systems you can't whiteboard.",
    ],
  },
};

/** All role-specific tips (for the Tips page). */
export const ROLE_TIPS: Record<string, RoleTips> = BY_ROLE;

export function tipsFor(role: string): RoleTips {
  const key = Object.keys(BY_ROLE).find(
    (k) => k.toLowerCase() === role.trim().toLowerCase()
  );
  return key ? BY_ROLE[key] : GENERAL_TIPS;
}
