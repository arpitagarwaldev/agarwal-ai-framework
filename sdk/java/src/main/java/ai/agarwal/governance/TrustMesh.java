package ai.agarwal.governance;

import ai.agarwal.core.Agarwal;
import java.util.*;
import java.util.function.Predicate;

/**
 * Trust Mesh — Policy engine, audit trails, governance scoring.
 */
public class TrustMesh {

    public record Policy(String id, String name, String severity, String action, Predicate<PolicyContext> condition, String message) {}
    public record PolicyContext(String agentId, String action, Map<String, Object> input, Map<String, Object> output) {}
    public record PolicyResult(String policyId, String policyName, boolean passed, String action, String severity, String message) {}
    public record AuditEntry(String id, long timestamp, String agentId, String action, Object input, Object output, String reasoning) {}
    public record TrustMeshScores(double explainability, double compliance, double safety, double auditability, double overall) {}

    private final List<Policy> policies = new ArrayList<>();
    private final List<AuditEntry> auditLog = new ArrayList<>();

    public String addPolicy(String name, String severity, String action, Predicate<PolicyContext> condition, String message) {
        String id = Agarwal.generateId("policy");
        policies.add(new Policy(id, name, severity, action, condition, message));
        return id;
    }

    public void removePolicy(String policyId) {
        policies.removeIf(p -> p.id().equals(policyId));
    }

    public List<PolicyResult> evaluate(PolicyContext context) {
        return policies.stream().map(policy -> {
            boolean triggered = policy.condition().test(context);
            return new PolicyResult(policy.id(), policy.name(), !triggered, triggered ? policy.action() : "log", policy.severity(), triggered ? policy.message() : "OK");
        }).toList();
    }

    public record AllowedResult(boolean allowed, List<PolicyResult> violations) {}

    public AllowedResult isAllowed(PolicyContext context) {
        List<PolicyResult> results = evaluate(context);
        List<PolicyResult> violations = results.stream().filter(r -> !r.passed() && "block".equals(r.action())).toList();
        return new AllowedResult(violations.isEmpty(), violations);
    }

    public String audit(String agentId, String action, Object input, Object output, String reasoning) {
        String id = Agarwal.generateId("audit");
        auditLog.add(new AuditEntry(id, System.currentTimeMillis(), agentId, action, input, output, reasoning));
        return id;
    }

    public TrustMeshScores calculateTMS() {
        List<AuditEntry> recent = auditLog.size() > 100 ? auditLog.subList(auditLog.size() - 100, auditLog.size()) : auditLog;
        double explainability = recent.isEmpty() ? 100 : (recent.stream().filter(a -> a.reasoning() != null).count() * 100.0 / recent.size());
        double compliance = 90; // simplified
        double safety = 95;
        double auditability = Math.min(100, auditLog.size() * 10.0);
        double overall = explainability * 0.25 + compliance * 0.30 + safety * 0.25 + auditability * 0.20;
        return new TrustMeshScores(explainability, compliance, safety, auditability, overall);
    }

    public List<AuditEntry> getAuditLog(int limit) {
        int start = Math.max(0, auditLog.size() - limit);
        return new ArrayList<>(auditLog.subList(start, auditLog.size()));
    }

    public List<Policy> getPolicies() { return Collections.unmodifiableList(policies); }

    // ─── Factory ─────────────────────────────────────────────────────────────

    public static TrustMesh createDefault() {
        TrustMesh mesh = new TrustMesh();
        mesh.addPolicy("no-destructive-ops", "high", "block",
            ctx -> {
                String act = ctx.action().toLowerCase();
                return act.contains("delete") || act.contains("drop") || act.contains("truncate");
            },
            "Destructive operation requires approval"
        );
        return mesh;
    }
}
