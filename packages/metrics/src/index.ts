/**
 * @agarwal-ai/metrics
 * Adaptive Statistics & Evaluation — AQI, AADV-Next, Bayesian estimation
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AQIScores {
  autonomy: number;
  reliability: number;
  alignment: number;
  efficiency: number;
  adaptability: number;
  overall: number;
}

export interface AQIWeights {
  autonomy: number;
  reliability: number;
  alignment: number;
  efficiency: number;
  adaptability: number;
}

export interface AADVResult {
  baseVelocity: number;
  aiAmplification: number;
  reworkPenalty: number;
  adjustedVelocity: number;
  confidenceInterval: [number, number];
}

export interface AgentMetricEvent {
  agentId: string;
  timestamp: number;
  taskCompleted: boolean;
  humanIntervention: boolean;
  taskComplexity: "trivial" | "simple" | "moderate" | "complex" | "critical";
  executionTimeMs: number;
  tokensUsed: number;
  costUSD: number;
  qualityScore?: number; // 0-100
  hadError: boolean;
  errorSeverity?: "critical" | "high" | "medium" | "low";
}

export interface SprintData {
  storyPointsCompleted: number;
  totalStoryPoints: number;
  sprintDuration: number; // days
  aiContributionRatio: number; // 0-1
  aiChurnRate: number; // 0-1
  defectRate: number; // 0-1
  testPassRate: number; // 0-1
}

// ─── AQI Calculator ──────────────────────────────────────────────────────────

const DEFAULT_WEIGHTS: AQIWeights = {
  autonomy: 0.20,
  reliability: 0.25,
  alignment: 0.25,
  efficiency: 0.15,
  adaptability: 0.15,
};

const COMPLEXITY_WEIGHTS: Record<string, number> = {
  trivial: 0.5,
  simple: 1.0,
  moderate: 2.0,
  complex: 4.0,
  critical: 8.0,
};

export class AQICalculator {
  private events: AgentMetricEvent[] = [];
  private weights: AQIWeights;

  constructor(weights?: Partial<AQIWeights>) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
  }

  /** Record a metric event */
  record(event: AgentMetricEvent): void {
    this.events.push(event);
  }

  /** Record multiple events */
  recordBatch(events: AgentMetricEvent[]): void {
    this.events.push(...events);
  }

  /** Calculate AQI for a specific agent */
  calculate(agentId?: string): AQIScores {
    const events = agentId
      ? this.events.filter((e) => e.agentId === agentId)
      : this.events;

    if (events.length === 0) {
      return { autonomy: 0, reliability: 0, alignment: 0, efficiency: 0, adaptability: 0, overall: 0 };
    }

    const autonomy = this.calcAutonomy(events);
    const reliability = this.calcReliability(events);
    const alignment = this.calcAlignment(events);
    const efficiency = this.calcEfficiency(events);
    const adaptability = this.calcAdaptability(events);

    const overall =
      autonomy * this.weights.autonomy +
      reliability * this.weights.reliability +
      alignment * this.weights.alignment +
      efficiency * this.weights.efficiency +
      adaptability * this.weights.adaptability;

    return { autonomy, reliability, alignment, efficiency, adaptability, overall };
  }

  /** Get score interpretation */
  interpret(score: number): { rating: string; action: string } {
    if (score >= 90) return { rating: "Excellent", action: "Ready for expanded autonomy" };
    if (score >= 75) return { rating: "Good", action: "Production-ready, normal monitoring" };
    if (score >= 60) return { rating: "Acceptable", action: "Production with increased oversight" };
    if (score >= 40) return { rating: "Needs Improvement", action: "Restricted to non-critical tasks" };
    return { rating: "Failing", action: "Remove from production, retrain/redesign" };
  }

  private calcAutonomy(events: AgentMetricEvent[]): number {
    let weightedAutonomous = 0;
    let weightedTotal = 0;
    for (const e of events) {
      const w = COMPLEXITY_WEIGHTS[e.taskComplexity] || 1;
      weightedTotal += w;
      if (e.taskCompleted && !e.humanIntervention) {
        weightedAutonomous += w;
      }
    }
    return weightedTotal > 0 ? (weightedAutonomous / weightedTotal) * 100 : 0;
  }

  private calcReliability(events: AgentMetricEvent[]): number {
    const severityWeights: Record<string, number> = { critical: 1.0, high: 0.7, medium: 0.3, low: 0.1 };
    let weightedFailures = 0;
    for (const e of events) {
      if (e.hadError && e.errorSeverity) {
        weightedFailures += severityWeights[e.errorSeverity] || 0;
      }
    }
    const failureRate = weightedFailures / events.length;
    return Math.max(0, (1 - failureRate) * 100);
  }

  private calcAlignment(events: AgentMetricEvent[]): number {
    const scored = events.filter((e) => e.qualityScore !== undefined);
    if (scored.length === 0) return 75; // default when no quality data
    const avg = scored.reduce((sum, e) => sum + (e.qualityScore || 0), 0) / scored.length;
    return avg;
  }

  private calcEfficiency(events: AgentMetricEvent[]): number {
    const completed = events.filter((e) => e.taskCompleted);
    if (completed.length === 0) return 0;
    // Normalize: lower cost + lower time = higher efficiency
    const avgCost = completed.reduce((s, e) => s + e.costUSD, 0) / completed.length;
    const avgTime = completed.reduce((s, e) => s + e.executionTimeMs, 0) / completed.length;
    // Simple scoring: efficiency degrades with cost and time
    const costScore = Math.max(0, 100 - avgCost * 1000); // $0.1 per task = 0 penalty
    const timeScore = Math.max(0, 100 - avgTime / 1000); // 100s = 0 penalty
    return (costScore + timeScore) / 2;
  }

  private calcAdaptability(events: AgentMetricEvent[]): number {
    // Measure: does performance hold across different complexity levels?
    const byComplexity = new Map<string, { success: number; total: number }>();
    for (const e of events) {
      const entry = byComplexity.get(e.taskComplexity) || { success: 0, total: 0 };
      entry.total++;
      if (e.taskCompleted) entry.success++;
      byComplexity.set(e.taskComplexity, entry);
    }
    if (byComplexity.size <= 1) return 70; // Not enough variety
    const rates = Array.from(byComplexity.values()).map((v) => v.success / v.total);
    const avg = rates.reduce((s, r) => s + r, 0) / rates.length;
    const variance = rates.reduce((s, r) => s + Math.pow(r - avg, 2), 0) / rates.length;
    // Lower variance = more adaptable
    return Math.max(0, (1 - Math.sqrt(variance)) * 100);
  }
}

// ─── AADV-Next Calculator ────────────────────────────────────────────────────

export class AADVCalculator {
  private sprints: SprintData[] = [];
  private calibrationFactor: number;

  constructor(calibrationFactor = 0.5) {
    this.calibrationFactor = calibrationFactor;
  }

  /** Add sprint data */
  addSprint(data: SprintData): void {
    this.sprints.push(data);
  }

  /** Calculate AADV-Next for latest sprint */
  calculate(sprint?: SprintData): AADVResult {
    const s = sprint || this.sprints[this.sprints.length - 1];
    if (!s) {
      return { baseVelocity: 0, aiAmplification: 1, reworkPenalty: 0, adjustedVelocity: 0, confidenceInterval: [0, 0] };
    }

    const baseVelocity = s.storyPointsCompleted / (s.sprintDuration / 7);
    const qualityWeight = (1 - s.defectRate) * s.testPassRate;
    const aiAmplification = 1 + this.calibrationFactor * s.aiContributionRatio * qualityWeight;
    const reworkPenalty = 0.3 * s.aiChurnRate * 1.0; // severity factor = 1.0
    const adjustedVelocity = baseVelocity * aiAmplification * (1 - reworkPenalty);

    // Simple confidence interval based on historical variance
    const historicalVelocities = this.sprints.map(
      (sp) => sp.storyPointsCompleted / (sp.sprintDuration / 7)
    );
    const stdDev = this.standardDeviation(historicalVelocities);
    const margin = 1.645 * stdDev; // 90% CI

    return {
      baseVelocity,
      aiAmplification,
      reworkPenalty,
      adjustedVelocity,
      confidenceInterval: [adjustedVelocity - margin, adjustedVelocity + margin],
    };
  }

  private standardDeviation(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (values.length - 1);
    return Math.sqrt(variance);
  }
}

// ─── Factory Functions ───────────────────────────────────────────────────────

/** Create an AQI calculator with custom weights */
export function createAQI(weights?: Partial<AQIWeights>): AQICalculator {
  return new AQICalculator(weights);
}

/** Create an AADV calculator */
export function createAADV(calibrationFactor?: number): AADVCalculator {
  return new AADVCalculator(calibrationFactor);
}
