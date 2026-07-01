package ai.agarwal.metrics;

import java.util.*;
import java.util.stream.*;

/**
 * Agent Quality Index (AQI) calculator.
 */
public class AQICalculator {

    public record MetricEvent(String agentId, long timestamp, boolean taskCompleted, boolean humanIntervention,
                              String taskComplexity, double executionTimeMs, int tokensUsed, double costUsd,
                              Double qualityScore, boolean hadError, String errorSeverity) {}

    public record AQIScores(double autonomy, double reliability, double alignment, double efficiency, double adaptability, double overall) {}

    private static final Map<String, Double> COMPLEXITY_WEIGHTS = Map.of("trivial", 0.5, "simple", 1.0, "moderate", 2.0, "complex", 4.0, "critical", 8.0);
    private static final Map<String, Double> SEVERITY_WEIGHTS = Map.of("critical", 1.0, "high", 0.7, "medium", 0.3, "low", 0.1);

    private final List<MetricEvent> events = new ArrayList<>();
    private final Map<String, Double> weights;

    public AQICalculator() {
        this(Map.of("autonomy", 0.20, "reliability", 0.25, "alignment", 0.25, "efficiency", 0.15, "adaptability", 0.15));
    }

    public AQICalculator(Map<String, Double> weights) {
        this.weights = new HashMap<>(weights);
    }

    public void record(MetricEvent event) { events.add(event); }
    public void recordBatch(List<MetricEvent> batch) { events.addAll(batch); }

    public AQIScores calculate(String agentId) {
        List<MetricEvent> filtered = agentId != null
            ? events.stream().filter(e -> agentId.equals(e.agentId())).toList()
            : events;

        if (filtered.isEmpty()) return new AQIScores(0, 0, 0, 0, 0, 0);

        double autonomy = calcAutonomy(filtered);
        double reliability = calcReliability(filtered);
        double alignment = calcAlignment(filtered);
        double efficiency = calcEfficiency(filtered);
        double adaptability = calcAdaptability(filtered);

        double overall = autonomy * weights.get("autonomy") + reliability * weights.get("reliability")
            + alignment * weights.get("alignment") + efficiency * weights.get("efficiency")
            + adaptability * weights.get("adaptability");

        return new AQIScores(autonomy, reliability, alignment, efficiency, adaptability, overall);
    }

    public AQIScores calculate() { return calculate(null); }

    public String interpret(double score) {
        if (score >= 90) return "Excellent — Ready for expanded autonomy";
        if (score >= 75) return "Good — Production-ready";
        if (score >= 60) return "Acceptable — Increased oversight recommended";
        if (score >= 40) return "Needs Improvement — Non-critical tasks only";
        return "Failing — Remove from production";
    }

    private double calcAutonomy(List<MetricEvent> events) {
        double weightedAuto = events.stream().filter(e -> e.taskCompleted() && !e.humanIntervention()).mapToDouble(e -> COMPLEXITY_WEIGHTS.getOrDefault(e.taskComplexity(), 1.0)).sum();
        double weightedTotal = events.stream().mapToDouble(e -> COMPLEXITY_WEIGHTS.getOrDefault(e.taskComplexity(), 1.0)).sum();
        return weightedTotal > 0 ? (weightedAuto / weightedTotal) * 100 : 0;
    }

    private double calcReliability(List<MetricEvent> events) {
        double weightedFailures = events.stream().filter(MetricEvent::hadError).mapToDouble(e -> SEVERITY_WEIGHTS.getOrDefault(e.errorSeverity(), 0.0)).sum();
        return Math.max(0, (1 - weightedFailures / events.size()) * 100);
    }

    private double calcAlignment(List<MetricEvent> events) {
        List<MetricEvent> scored = events.stream().filter(e -> e.qualityScore() != null).toList();
        if (scored.isEmpty()) return 75;
        return scored.stream().mapToDouble(MetricEvent::qualityScore).average().orElse(75);
    }

    private double calcEfficiency(List<MetricEvent> events) {
        List<MetricEvent> completed = events.stream().filter(MetricEvent::taskCompleted).toList();
        if (completed.isEmpty()) return 0;
        double avgCost = completed.stream().mapToDouble(MetricEvent::costUsd).average().orElse(0);
        double avgTime = completed.stream().mapToDouble(MetricEvent::executionTimeMs).average().orElse(0);
        return (Math.max(0, 100 - avgCost * 1000) + Math.max(0, 100 - avgTime / 1000)) / 2;
    }

    private double calcAdaptability(List<MetricEvent> events) {
        Map<String, List<MetricEvent>> byComplexity = events.stream().collect(Collectors.groupingBy(MetricEvent::taskComplexity));
        if (byComplexity.size() <= 1) return 70;
        double[] rates = byComplexity.values().stream().mapToDouble(l -> l.stream().filter(MetricEvent::taskCompleted).count() / (double) l.size()).toArray();
        double avg = Arrays.stream(rates).average().orElse(0);
        double variance = Arrays.stream(rates).map(r -> Math.pow(r - avg, 2)).average().orElse(0);
        return Math.max(0, (1 - Math.sqrt(variance)) * 100);
    }
}
