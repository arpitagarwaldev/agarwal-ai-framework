package ai.agarwal.agents;

import ai.agarwal.core.Agarwal;
import java.util.*;
import java.util.concurrent.*;

/**
 * AI Agent with circuit breaker pattern and retry logic.
 */
public class Agent {

    public enum Role { ORCHESTRATOR, SPECIALIST, VALIDATOR, MONITOR, WORKER }
    public enum Status { IDLE, RUNNING, PAUSED, COMPLETED, FAILED, TERMINATED }

    private final String id;
    private final String name;
    private final Role role;
    private final String model;
    private final String systemPrompt;
    private final int maxRetries;
    private final int circuitBreakerThreshold;
    private volatile Status status = Status.IDLE;
    private int failureCount = 0;
    private String circuitState = "closed"; // closed | open | half-open
    private final List<Map<String, Object>> messages = new ArrayList<>();

    private Agent(Builder builder) {
        this.id = Agarwal.generateId("agent");
        this.name = builder.name;
        this.role = builder.role;
        this.model = builder.model;
        this.systemPrompt = builder.systemPrompt;
        this.maxRetries = builder.maxRetries;
        this.circuitBreakerThreshold = builder.circuitBreakerThreshold;

        if (systemPrompt != null) {
            messages.add(Map.of("role", "system", "content", systemPrompt));
        }
    }

    public CompletableFuture<AgentResult> execute(String input) {
        return CompletableFuture.supplyAsync(() -> {
            if ("open".equals(circuitState)) {
                return new AgentResult(id, "failure", "Circuit breaker OPEN", 0, 0);
            }

            status = Status.RUNNING;
            long startTime = System.currentTimeMillis();
            messages.add(Map.of("role", "user", "content", input));

            try {
                String output = processTask(input);
                onSuccess();
                status = Status.COMPLETED;
                return new AgentResult(id, "success", output, 0.85, System.currentTimeMillis() - startTime);
            } catch (Exception e) {
                onFailure();
                status = Status.FAILED;
                return new AgentResult(id, "failure", e.getMessage(), 0, System.currentTimeMillis() - startTime);
            }
        });
    }

    /**
     * Override this method to integrate with your LLM provider.
     */
    protected String processTask(String input) {
        return String.format("[Agent %s] Processed: %s", name, input);
    }

    public void pause() { status = Status.PAUSED; }
    public void resume() { if (status == Status.PAUSED) status = Status.IDLE; }
    public void terminate() { status = Status.TERMINATED; }

    public String getId() { return id; }
    public String getName() { return name; }
    public Role getRole() { return role; }
    public Status getStatus() { return status; }
    public String getModel() { return model; }

    private void onSuccess() {
        failureCount = 0;
        if ("half-open".equals(circuitState)) circuitState = "closed";
    }

    private void onFailure() {
        failureCount++;
        if (failureCount >= circuitBreakerThreshold) {
            circuitState = "open";
            CompletableFuture.delayedExecutor(30, TimeUnit.SECONDS).execute(() -> {
                circuitState = "half-open";
                failureCount = 0;
            });
        }
    }

    // ─── Builder ─────────────────────────────────────────────────────────────

    public static Builder builder(String name) { return new Builder(name); }

    public static Agent specialist(String name, String specialization) {
        return builder(name)
            .role(Role.SPECIALIST)
            .systemPrompt("You are a specialist in " + specialization)
            .build();
    }

    public static class Builder {
        private final String name;
        private Role role = Role.SPECIALIST;
        private String model = "claude-sonnet-4";
        private String systemPrompt;
        private int maxRetries = 2;
        private int circuitBreakerThreshold = 5;

        public Builder(String name) { this.name = name; }
        public Builder role(Role role) { this.role = role; return this; }
        public Builder model(String model) { this.model = model; return this; }
        public Builder systemPrompt(String prompt) { this.systemPrompt = prompt; return this; }
        public Builder maxRetries(int retries) { this.maxRetries = retries; return this; }
        public Builder circuitBreakerThreshold(int threshold) { this.circuitBreakerThreshold = threshold; return this; }
        public Agent build() { return new Agent(this); }
    }

    // ─── Result ──────────────────────────────────────────────────────────────

    public record AgentResult(String agentId, String status, String output, double confidence, long durationMs) {}
}
