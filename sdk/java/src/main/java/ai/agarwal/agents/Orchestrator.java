package ai.agarwal.agents;

import ai.agarwal.core.Agarwal;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

/**
 * Multi-agent orchestrator with routing strategies.
 */
public class Orchestrator {

    public enum Strategy { ROUND_ROBIN, CAPABILITY, LOAD_BALANCED }

    private final String id;
    private final String name;
    private final Strategy strategy;
    private final List<Agent> agents = new CopyOnWriteArrayList<>();
    private int currentIndex = 0;

    public Orchestrator(String name, Strategy strategy) {
        this.id = Agarwal.generateId("orch");
        this.name = name;
        this.strategy = strategy;
    }

    public void register(Agent agent) { agents.add(agent); }
    public void remove(String agentId) { agents.removeIf(a -> a.getId().equals(agentId)); }

    public CompletableFuture<Agent.AgentResult> dispatch(String input) {
        Agent agent = selectAgent();
        if (agent == null) {
            return CompletableFuture.completedFuture(
                new Agent.AgentResult("none", "failure", "No available agents", 0, 0)
            );
        }
        return agent.execute(input);
    }

    public CompletableFuture<List<Agent.AgentResult>> fanOut(String input) {
        List<CompletableFuture<Agent.AgentResult>> futures = agents.stream()
            .map(a -> a.execute(input))
            .collect(Collectors.toList());

        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenApply(v -> futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList()));
    }

    public List<Agent> getAgents() { return Collections.unmodifiableList(agents); }
    public String getId() { return id; }
    public String getName() { return name; }

    private Agent selectAgent() {
        List<Agent> available = agents.stream()
            .filter(a -> a.getStatus() == Agent.Status.IDLE || a.getStatus() == Agent.Status.COMPLETED)
            .collect(Collectors.toList());

        if (available.isEmpty()) return null;

        return switch (strategy) {
            case ROUND_ROBIN -> {
                Agent agent = available.get(currentIndex % available.size());
                currentIndex++;
                yield agent;
            }
            default -> available.get(0);
        };
    }
}
