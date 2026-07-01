package ai.agarwal.security;

import ai.agarwal.core.Agarwal;
import java.util.*;
import java.util.regex.*;

/**
 * Security Shield — Input scanning, output filtering, rate limiting.
 */
public class SecurityShield {

    public record ThreatDetection(String type, String severity, String description, String originalText) {}
    public record ScanResult(boolean safe, List<ThreatDetection> threats, String sanitized, int score) {}

    private static final List<PatternEntry> INJECTION_PATTERNS = List.of(
        new PatternEntry("ignore\\s+(all\\s+)?previous\\s+(instructions|prompts|rules)", "prompt-injection", "critical"),
        new PatternEntry("you\\s+are\\s+now\\s+(DAN|a\\s+new|unrestricted)", "jailbreak", "critical"),
        new PatternEntry("```\\s*(system|admin|root)\\b", "role-injection", "high"),
        new PatternEntry("\\[SYSTEM\\]|\\[ADMIN\\]|\\[OVERRIDE\\]", "role-tag-injection", "high"),
        new PatternEntry("forget\\s+(everything|all|your\\s+instructions)", "memory-wipe", "high"),
        new PatternEntry("base64\\s*decode|eval\\(|exec\\(", "code-injection", "critical"),
        new PatternEntry("<script|javascript:|on(error|load|click)\\s*=", "xss-attempt", "high"),
        new PatternEntry(";\\s*(DROP|DELETE|TRUNCATE|ALTER)\\s", "sql-injection", "critical")
    );

    private static final List<PatternEntry> SECRET_PATTERNS = List.of(
        new PatternEntry("AKIA[0-9A-Z]{16}", "AWS Key", "critical"),
        new PatternEntry("gh[pousr]_[A-Za-z0-9_]{36,}", "GitHub Token", "critical"),
        new PatternEntry("-----BEGIN\\s+(RSA\\s+)?PRIVATE\\s+KEY-----", "Private Key", "critical"),
        new PatternEntry("\\b\\d{3}-\\d{2}-\\d{4}\\b", "SSN", "critical"),
        new PatternEntry("\\b(?:\\d{4}[- ]?){3}\\d{4}\\b", "Credit Card", "critical")
    );

    private final int maxInputLength;
    private final Map<String, long[]> rateLimitWindows = new HashMap<>();
    private final int maxRequestsPerMinute;

    public SecurityShield() { this(50000, 60); }
    public SecurityShield(int maxInputLength, int maxRequestsPerMinute) {
        this.maxInputLength = maxInputLength;
        this.maxRequestsPerMinute = maxRequestsPerMinute;
    }

    /**
     * Scan input for threats.
     */
    public ScanResult scanInput(String input) {
        List<ThreatDetection> threats = new ArrayList<>();
        String sanitized = input;

        if (input.length() > maxInputLength) {
            threats.add(new ThreatDetection("length-overflow", "medium", "Input too long", null));
            sanitized = input.substring(0, maxInputLength);
        }

        for (PatternEntry pe : INJECTION_PATTERNS) {
            Matcher m = Pattern.compile(pe.pattern, Pattern.CASE_INSENSITIVE).matcher(input);
            if (m.find()) {
                threats.add(new ThreatDetection(pe.type, pe.severity, "Detected " + pe.type, m.group().substring(0, Math.min(m.group().length(), 100))));
            }
        }

        Map<String, Integer> severityScores = Map.of("critical", 40, "high", 25, "medium", 10, "low", 5);
        int penalty = threats.stream().mapToInt(t -> severityScores.getOrDefault(t.severity(), 0)).sum();
        int score = Math.max(0, 100 - penalty);

        return new ScanResult(threats.isEmpty(), threats, sanitized, score);
    }

    /**
     * Filter secrets from output.
     */
    public String filterOutput(String output) {
        String filtered = output;
        for (PatternEntry pe : SECRET_PATTERNS) {
            filtered = Pattern.compile(pe.pattern, Pattern.CASE_INSENSITIVE).matcher(filtered).replaceAll("[REDACTED:" + pe.type + "]");
        }
        return filtered;
    }

    /**
     * Check rate limit.
     */
    public boolean checkRateLimit(String key) {
        long now = System.currentTimeMillis();
        long[] window = rateLimitWindows.get(key);
        if (window == null || now >= window[1]) {
            rateLimitWindows.put(key, new long[]{1, now + 60000});
            return true;
        }
        if (window[0] >= maxRequestsPerMinute) return false;
        window[0]++;
        return true;
    }

    // ─── Factory ─────────────────────────────────────────────────────────────

    public static SecurityShield create() { return new SecurityShield(); }
    public static SecurityShield create(int maxInputLength, int maxRPM) { return new SecurityShield(maxInputLength, maxRPM); }

    private record PatternEntry(String pattern, String type, String severity) {}
}
