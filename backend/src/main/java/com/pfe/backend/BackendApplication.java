package com.pfe.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        // Create a custom logic to load .env from possible locations
        // This avoids dependency conflicts with Dotenv libraries
        loadEnvFile("backend/.env"); // Try loading from backend folder (root execution)
        loadEnvFile(".env");         // Try loading from current folder (backend execution)
        
        SpringApplication.run(BackendApplication.class, args);
    }

    private static void loadEnvFile(String path) {
        java.io.File file = new java.io.File(path);
        if (file.exists()) {
            try (java.util.Scanner scanner = new java.util.Scanner(file)) {
                while (scanner.hasNextLine()) {
                    String line = scanner.nextLine().trim();
                    // Basic parsing: ignore comments and empty lines
                    if (!line.startsWith("#") && line.contains("=")) {
                        String[] parts = line.split("=", 2);
                        String key = parts[0].trim();
                        String value = parts[1].trim();
                        
                        // Remove quotes if present
                        if (value.startsWith("\"") && value.endsWith("\"")) {
                            value = value.substring(1, value.length() - 1);
                        } else if (value.startsWith("'") && value.endsWith("'")) {
                            value = value.substring(1, value.length() - 1);
                        }
                        
                        // Set system property if not already set (preserve existing env vars)
                        if (System.getProperty(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                }
            } catch (java.io.FileNotFoundException e) {
                // Should not happen as we checked exists(), but ignore
            }
        }
    }
}


