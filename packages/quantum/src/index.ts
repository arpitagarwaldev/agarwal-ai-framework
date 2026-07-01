/**
 * @agarwal-ai/quantum
 * Quantum-Classical Hybrid — QRI scoring, crypto-agility, quantum readiness assessment
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface QRIScores {
  literacy: number;
  algorithmSuitability: number;
  cryptoAgility: number;
  infrastructure: number;
  vendorEvaluation: number;
  experimentalPipeline: number;
  overall: number;
}

export interface QRIWeights {
  literacy: number;
  algorithmSuitability: number;
  cryptoAgility: number;
  infrastructure: number;
  vendorEvaluation: number;
  experimentalPipeline: number;
}

export type QRILevel = "unaware" | "aware" | "prepared" | "hybrid" | "quantum-native";

export interface QuantumWorkloadAssessment {
  workloadName: string;
  problemType: "optimization" | "simulation" | "sampling" | "search" | "ml" | "crypto";
  inputSize: number;
  classicalComplexity: string;
  quantumSpeedup: "none" | "polynomial" | "quadratic" | "exponential";
  feasibilityScore: number; // 0-100
  recommendation: "strong-candidate" | "promising" | "monitor" | "unlikely" | "not-suitable";
}

export interface CryptoAsset {
  id: string;
  name: string;
  algorithm: string;
  keySize: number;
  usage: string;
  quantumVulnerable: boolean;
  migrationStatus: "not-started" | "planned" | "in-progress" | "completed";
  confidentialityYears: number;
}

export type PQCAlgorithm = "ML-KEM-768" | "ML-KEM-1024" | "ML-DSA-65" | "ML-DSA-87" | "SLH-DSA-128" | "SLH-DSA-256";

// ─── QRI Calculator ──────────────────────────────────────────────────────────

const DEFAULT_QRI_WEIGHTS: QRIWeights = {
  literacy: 0.15,
  algorithmSuitability: 0.25,
  cryptoAgility: 0.20,
  infrastructure: 0.20,
  vendorEvaluation: 0.10,
  experimentalPipeline: 0.10,
};

export class QRICalculator {
  private weights: QRIWeights;
  private scores: Partial<Record<keyof QRIWeights, number>> = {};

  constructor(weights?: Partial<QRIWeights>) {
    this.weights = { ...DEFAULT_QRI_WEIGHTS, ...weights };
  }

  /** Set a dimension score (0-100) */
  setScore(dimension: keyof QRIWeights, score: number): this {
    this.scores[dimension] = Math.max(0, Math.min(100, score));
    return this;
  }

  /** Calculate overall QRI */
  calculate(): QRIScores {
    const literacy = this.scores.literacy ?? 0;
    const algorithmSuitability = this.scores.algorithmSuitability ?? 0;
    const cryptoAgility = this.scores.cryptoAgility ?? 0;
    const infrastructure = this.scores.infrastructure ?? 0;
    const vendorEvaluation = this.scores.vendorEvaluation ?? 0;
    const experimentalPipeline = this.scores.experimentalPipeline ?? 0;

    const overall =
      literacy * this.weights.literacy +
      algorithmSuitability * this.weights.algorithmSuitability +
      cryptoAgility * this.weights.cryptoAgility +
      infrastructure * this.weights.infrastructure +
      vendorEvaluation * this.weights.vendorEvaluation +
      experimentalPipeline * this.weights.experimentalPipeline;

    return { literacy, algorithmSuitability, cryptoAgility, infrastructure, vendorEvaluation, experimentalPipeline, overall };
  }

  /** Get maturity level */
  getLevel(): QRILevel {
    const { overall } = this.calculate();
    if (overall >= 81) return "quantum-native";
    if (overall >= 61) return "hybrid";
    if (overall >= 41) return "prepared";
    if (overall >= 21) return "aware";
    return "unaware";
  }
}

// ─── Crypto Inventory ────────────────────────────────────────────────────────

export class CryptoInventory {
  private assets: CryptoAsset[] = [];

  /** Add a crypto asset */
  add(asset: Omit<CryptoAsset, "quantumVulnerable">): void {
    const vulnerable = this.isQuantumVulnerable(asset.algorithm);
    this.assets.push({ ...asset, quantumVulnerable: vulnerable });
  }

  /** Get all vulnerable assets */
  getVulnerable(): CryptoAsset[] {
    return this.assets.filter((a) => a.quantumVulnerable);
  }

  /** Get urgent migrations (vulnerable + long confidentiality) */
  getUrgent(minYears = 10): CryptoAsset[] {
    return this.assets.filter(
      (a) => a.quantumVulnerable && a.confidentialityYears >= minYears && a.migrationStatus !== "completed"
    );
  }

  /** Get migration progress */
  getMigrationProgress(): { total: number; completed: number; percentage: number } {
    const vulnerable = this.getVulnerable();
    const completed = vulnerable.filter((a) => a.migrationStatus === "completed").length;
    return {
      total: vulnerable.length,
      completed,
      percentage: vulnerable.length > 0 ? (completed / vulnerable.length) * 100 : 100,
    };
  }

  /** Recommend PQC algorithm for a use case */
  recommendPQC(usage: "key-exchange" | "signature" | "hash"): PQCAlgorithm {
    switch (usage) {
      case "key-exchange": return "ML-KEM-768";
      case "signature": return "ML-DSA-65";
      case "hash": return "SLH-DSA-128";
    }
  }

  /** Get crypto-agility score (0-100) */
  getCryptoAgilityScore(): number {
    if (this.assets.length === 0) return 0;
    const progress = this.getMigrationProgress();
    const inventoryComplete = this.assets.length > 0 ? 25 : 0;
    const migrationProgress = progress.percentage * 0.5;
    const urgentHandled = this.getUrgent().length === 0 ? 25 : 0;
    return Math.min(100, inventoryComplete + migrationProgress + urgentHandled);
  }

  private isQuantumVulnerable(algorithm: string): boolean {
    const vulnerable = ["rsa", "ecdsa", "ecdh", "dsa", "dh", "elgamal"];
    return vulnerable.some((v) => algorithm.toLowerCase().includes(v));
  }
}

// ─── Workload Assessor ───────────────────────────────────────────────────────

export function assessQuantumWorkload(
  workloadName: string,
  problemType: QuantumWorkloadAssessment["problemType"],
  inputSize: number,
  classicalComplexity: string
): QuantumWorkloadAssessment {
  let speedup: QuantumWorkloadAssessment["quantumSpeedup"] = "none";
  let score = 0;

  // Assess based on problem type
  switch (problemType) {
    case "optimization":
      speedup = inputSize > 100 ? "quadratic" : "polynomial";
      score = Math.min(100, inputSize / 10 + 30);
      break;
    case "simulation":
      speedup = "exponential";
      score = Math.min(100, 60 + inputSize / 50);
      break;
    case "sampling":
      speedup = "quadratic";
      score = Math.min(100, 40 + inputSize / 20);
      break;
    case "search":
      speedup = "quadratic";
      score = inputSize > 1000 ? 70 : 40;
      break;
    case "ml":
      speedup = inputSize > 500 ? "polynomial" : "none";
      score = Math.min(80, 20 + inputSize / 25);
      break;
    case "crypto":
      speedup = "exponential";
      score = 90;
      break;
  }

  let recommendation: QuantumWorkloadAssessment["recommendation"];
  if (score >= 80) recommendation = "strong-candidate";
  else if (score >= 60) recommendation = "promising";
  else if (score >= 40) recommendation = "monitor";
  else if (score >= 20) recommendation = "unlikely";
  else recommendation = "not-suitable";

  return {
    workloadName,
    problemType,
    inputSize,
    classicalComplexity,
    quantumSpeedup: speedup,
    feasibilityScore: score,
    recommendation,
  };
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/** Create a QRI calculator */
export function createQRI(weights?: Partial<QRIWeights>): QRICalculator {
  return new QRICalculator(weights);
}

/** Create a crypto inventory */
export function createCryptoInventory(): CryptoInventory {
  return new CryptoInventory();
}
