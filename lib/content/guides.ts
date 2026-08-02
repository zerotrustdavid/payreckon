/**
 * Guide content. Written for PayReckon — plain-English explanations of the rules
 * the calculators implement, so a user can understand the number as well as read it.
 */

export interface GuideSection {
  heading: string;
  body: string[];
}

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  readingTime: string;
  sections: GuideSection[];
  relatedCalculator?: { slug: string; label: string };
}

export const GUIDES: Guide[] = [
  {
    slug: "ir35",
    title: "Understanding IR35",
    summary:
      "What the off-payroll rules actually test, who decides your status, and why the answer changes your take-home so much.",
    readingTime: "5 min read",
    relatedCalculator: {
      slug: "inside-ir35-umbrella",
      label: "Inside IR35 calculator",
    },
    sections: [
      {
        heading: "What IR35 is for",
        body: [
          "IR35 exists to stop someone working like an employee but being paid like a business. If you left a permanent job on Friday and came back on Monday doing the same work, from the same desk, under the same manager — but through a company — the tax system would be losing employment taxes on work that is, in substance, employment.",
          "The rules therefore ask a single question: strip away the contract and the company, and look at how the work is really done. Does the relationship look like employment? If it does, the engagement is 'inside IR35' and should be taxed broadly as employment. If it genuinely does not, it is 'outside IR35'.",
        ],
      },
      {
        heading: "The tests that matter",
        body: [
          "There is no statutory checklist. Status comes from decades of employment case law, and three factors carry most of the weight.",
          "Control — how much say the client has over what you do, when, where and how. A genuine contractor is engaged to deliver an outcome, not to be directed through a working day.",
          "Substitution — whether you could send a suitably qualified replacement. A real right of substitution points strongly away from employment, because employment is personal. A clause that exists on paper but would never be honoured in practice carries little weight.",
          "Mutuality of obligation — whether the client must offer work and you must accept it. An employer keeps you occupied; a client buys a defined piece of work and the relationship ends when it is delivered.",
          "Around these sit the secondary indicators: whether you take financial risk, provide your own equipment, work for other clients, and how far you are integrated into the organisation.",
        ],
      },
      {
        heading: "Who decides, and who carries the risk",
        body: [
          "Since April 2021, for engagements with medium and large private-sector clients — and across the public sector — the client determines your status, not you. They must give you a Status Determination Statement setting out the decision and their reasoning, and you have the right to challenge it.",
          "Where the client is a small company, responsibility stays with your own limited company. 'Small' is defined by the Companies Act tests on turnover, balance sheet total and employee numbers.",
          "The party that gets it wrong carries the liability, which is why many clients became cautious after the reform, and why blanket 'inside' determinations became common even for engagements that would have withstood scrutiny.",
        ],
      },
      {
        heading: "Why the money differs so much",
        body: [
          "Inside IR35, your fee is treated as employment income. Before you are paid anything, it must absorb employer's National Insurance, the Apprenticeship Levy where it applies, and any umbrella margin. What is left is taxed through PAYE with employee National Insurance on top.",
          "Outside IR35 through a limited company, the money is taxed as business profit — corporation tax first, then income tax on any salary and dividend tax on distributions. There is no employer or employee National Insurance on dividends, which is where most of the difference historically came from.",
          "That gap has narrowed. Dividend tax rates rose two percentage points in April 2026, and employer National Insurance rose to 15% on a much lower threshold in April 2025. Run both calculators against your own rate rather than relying on rules of thumb from a few years ago.",
        ],
      },
    ],
  },
  {
    slug: "umbrella-companies",
    title: "How umbrella companies work",
    summary:
      "Where your assignment rate actually goes, what the margin buys, and how to read an umbrella illustration without being misled.",
    readingTime: "5 min read",
    relatedCalculator: {
      slug: "inside-ir35-umbrella",
      label: "Inside IR35 calculator",
    },
    sections: [
      {
        heading: "The employer in the middle",
        body: [
          "An umbrella company employs you. The agency pays it your assignment rate, and it pays you a salary through PAYE. For an inside-IR35 engagement this is usually the simplest arrangement: you get employment rights, statutory holiday and a single continuous employment record across multiple assignments.",
          "The critical thing to understand is that the assignment rate is not a salary. It is the total amount the agency pays for your services, and every cost of employing you has to come out of it before your gross pay exists.",
        ],
      },
      {
        heading: "What comes out of the assignment rate",
        body: [
          "The umbrella's margin — the only part it keeps as its fee, typically a fixed amount per week or month rather than a percentage.",
          "Employer's National Insurance — 15% of your gross pay above the secondary threshold in 2026/27. This is a genuine employment cost, not a deduction the umbrella invented, but it is funded from your rate rather than by the agency.",
          "The Apprenticeship Levy — 0.5%, which large employers pay on their whole pay bill and most umbrellas pass on.",
          "Employer pension contributions, if you are enrolled and have not opted out.",
          "Only what remains is your gross taxable pay, and income tax, employee National Insurance and any student loan repayment come out of that.",
        ],
      },
      {
        heading: "The circular calculation",
        body: [
          "Employer's National Insurance is charged on your gross pay — but your gross pay is what is left after employer's National Insurance is taken out. Each depends on the other, so the figure cannot be found by simple subtraction.",
          "Many calculators approximate this, or apply the employer rate to the whole assignment rate, which overstates the deduction. PayReckon solves the relationship algebraically, so the gross pay it reports, plus every employment cost calculated on it, adds back to your assignment rate exactly.",
        ],
      },
      {
        heading: "Holiday pay: rolled up or accrued",
        body: [
          "Your statutory holiday entitlement is 5.6 weeks, which works out at 12.07% of the hours you actually work. Umbrellas handle it in one of two ways.",
          "Rolled up (sometimes called 'advanced'): the holiday element is paid with every payment. Your take-home looks higher week to week, but nothing is set aside for the weeks you do not work.",
          "Accrued: the umbrella retains the holiday element and pays it when you take leave. Your regular take-home is lower, but the money is still yours — which is why PayReckon shows accrued holiday as leaving your take-home while still counting towards total capital.",
          "Whichever applies, be sure you know which one your umbrella uses, and that accrued holiday is actually paid out when you leave an assignment.",
        ],
      },
      {
        heading: "Reading an illustration critically",
        body: [
          "Compare margins on the same basis — a weekly margin and a monthly one are not comparable until you annualise them.",
          "Be wary of any arrangement promising materially more take-home than a straightforward PAYE calculation. Schemes routing pay through loans, annuities or 'advances' have left large numbers of contractors with retrospective tax bills. If the take-home looks too good for the rate, the difference is usually tax that has not been paid yet.",
        ],
      },
    ],
  },
  {
    slug: "limited-companies",
    title: "Working through a limited company",
    summary:
      "Corporation tax, the salary and dividend split, what you can actually claim, and when the structure stops being worth it.",
    readingTime: "6 min read",
    relatedCalculator: {
      slug: "outside-ir35-limited",
      label: "Outside IR35 calculator",
    },
    sections: [
      {
        heading: "Two layers of tax",
        body: [
          "Your company is a separate legal person. Money it earns belongs to the company, not to you, and is taxed twice on its way to your bank account: corporation tax on the company's profit, then personal tax on whatever you take out.",
          "That sounds punitive, but the second layer is where the flexibility lives. You choose how much to take as salary, how much as dividends, and how much to leave in the company — and each is taxed differently.",
        ],
      },
      {
        heading: "Corporation tax and marginal relief",
        body: [
          "Profits up to £50,000 are taxed at the small profits rate of 19%. Profits of £250,000 or more are taxed at the main rate of 25%. Between the two, you pay the main rate less Marginal Relief, which produces an effective rate that climbs smoothly between 19% and 25%.",
          "The consequence is a marginal rate of 26.5% on every pound of profit between the two limits — higher than the headline main rate. It is worth knowing where you sit in that band before deciding whether to make an additional pension contribution or defer income.",
          "Both limits are divided by the number of associated companies and pro-rated for accounting periods shorter than twelve months.",
        ],
      },
      {
        heading: "The salary and dividend split",
        body: [
          "Salary is an allowable expense, so it reduces the company's profit before corporation tax. It also attracts income tax, employee National Insurance above the primary threshold, and employer National Insurance above the secondary threshold — which for 2026/27 is only £5,000.",
          "Dividends are paid from post-corporation-tax profit, so they get no deduction, but they carry no National Insurance at all. In 2026/27 they are taxed at 10.75%, 35.75% and 39.35% depending on which band they fall into, after a £500 dividend allowance.",
          "The common approach is a salary at or near the personal allowance — enough to use the tax-free band and maintain a qualifying year for the State Pension — with the balance taken as dividends. A salary at the secondary threshold avoids employer National Insurance entirely but leaves part of the personal allowance unused. The calculator lets you compare both against your own numbers rather than assuming.",
        ],
      },
      {
        heading: "Expenses and the pension route",
        body: [
          "A company expense must be incurred wholly and exclusively for the business. Accountancy fees, business insurance, equipment, software, professional subscriptions and genuine business travel generally qualify. Ordinary commuting to a single long-term workplace generally does not.",
          "Employer pension contributions are usually the most efficient extraction route available: the company gets a corporation tax deduction, there is no National Insurance, and no personal tax until you draw the pension. They are limited by the annual allowance and by the 'wholly and exclusively' test.",
        ],
      },
      {
        heading: "Closing the company",
        body: [
          "When you wind up a solvent company, retained profits can be distributed as capital rather than income. Business Asset Disposal Relief may apply, taxing qualifying gains at a reduced rate — 18% for disposals on or after 6 April 2026, up from 14% the previous year and 10% before that.",
          "The relief has a lifetime limit and conditions on how long you have held the shares and traded. Anti-avoidance rules can also treat a distribution as income if you start a similar business shortly afterwards. This is one to take advice on rather than assume.",
        ],
      },
      {
        heading: "When it stops being worth it",
        body: [
          "A limited company carries real overhead: accounts, corporation tax returns, confirmation statements, payroll, and a personal Self Assessment. That is worth it at a good day rate on outside-IR35 work, and rarely worth it for occasional work or where every engagement is caught by IR35.",
          "The advantage has also narrowed. Dividend rates rose in April 2026 and employer National Insurance rose the year before. Run your own figures through both calculators before assuming the company route wins.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
