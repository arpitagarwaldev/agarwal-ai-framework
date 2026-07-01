package ai.agarwal.core;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * AGARWAL AI Framework — Core initialization and configuration.
 */
public class Agarwal {

    public enum Layer {
        AGENT, GOVERNANCE, ALGORITHM, RESILIENT, WORKFLOW, AUTONOMOUS, LIFECYCLE
    }

    public enum LogLevel {
        DEBUG, INFO, WARN, ERROR
    }

    private final String name;
    private final LogLevel logLevel;
    private final Set<Layer> enabledLayers;
    private final int maxRetries;
    private final long timeoutMs;
    private boolean initialized = false;

    private Agarwal(Builder builder) {
        this.name = builder.name;
        this.logLevel = builder.logLevel;
        this.enabledLayers = new HashSet<>(builder.enabledLayers);
        this.maxRetries = builder.maxRetries;
        this.timeoutMs = builder.timeoutMs;
    }

    public Agarwal init() {
        if (initialized) {
            log(LogLevel.WARN, "Framework already initialized");
            return this;
        }
        log(LogLevel.INFO, "Initializing AGARWAL Framework: " + name);
        log(LogLevel.INFO, "Active layers: " + enabledLayers);
        initialized = true;
        return this;
    }

    public boolean isLayerEnabled(Layer layer) {
        return enabledLayers.contains(layer);
    }

    public void enableLayer(Layer layer) {
        enabledLayers.add(layer);
    }

    public void disableLayer(Layer layer) {
        enabledLayers.remove(layer);
    }

    public Set<Layer> getActiveLayers() {
        return Collections.unmodifiableSet(enabledLayers);
    }

    public String getName() { return name; }
    public int getMaxRetries() { return maxRetries; }
    public long getTimeoutMs() { return timeoutMs; }

    private void log(LogLevel level, String message) {
        if (level.ordinal() >= logLevel.ordinal()) {
            System.out.println("[AGARWAL:" + level + "] " + message);
        }
    }

    // ─── Builder ─────────────────────────────────────────────────────────────

    public static Builder builder() {
        return new Builder();
    }

    public static Agarwal createDefault() {
        return builder().build().init();
    }

    public static class Builder {
        private String name = "agarwal-project";
        private LogLevel logLevel = LogLevel.INFO;
        private final Set<Layer> enabledLayers = EnumSet.of(
            Layer.AGENT, Layer.GOVERNANCE, Layer.WORKFLOW, Layer.AUTONOMOUS, Layer.LIFECYCLE
        );
        private int maxRetries = 3;
        private long timeoutMs = 30000;

        public Builder name(String name) { this.name = name; return this; }
        public Builder logLevel(LogLevel level) { this.logLevel = level; return this; }
        public Builder enableLayer(Layer layer) { this.enabledLayers.add(layer); return this; }
        public Builder disableLayer(Layer layer) { this.enabledLayers.remove(layer); return this; }
        public Builder maxRetries(int retries) { this.maxRetries = retries; return this; }
        public Builder timeoutMs(long ms) { this.timeoutMs = ms; return this; }

        public Agarwal build() { return new Agarwal(this); }
    }

    // ─── Utility: ID Generator ───────────────────────────────────────────────

    public static String generateId(String prefix) {
        String timestamp = Long.toHexString(System.currentTimeMillis());
        String random = UUID.randomUUID().toString().substring(0, 8);
        return prefix + "_" + timestamp + "_" + random;
    }

    public static String generateId() {
        return generateId("ag");
    }
}
