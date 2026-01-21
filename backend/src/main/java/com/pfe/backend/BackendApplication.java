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
        if (!file.exists()) {
            return; // Early return to avoid nesting
        }


        
        try (java.util.Scanner scanner = new java.util.Scanner(file)) {
            while (scanner.hasNextLine()) {
                String line = scanner.nextLine().trim();
                processEnvLine(line);
            }
        } catch (java.io.FileNotFoundException e) {
            // Fichier .env non trouvé, ignoré intentionnellement car c'est optionnel
        }
    }
    
    private static void processEnvLine(String line) {
        if (!isValidEnvLine(line)) {
            return; // Early return for invalid lines
        }
        
        String[] parts = line.split("=", 2);
        String key = parts[0].trim();
        String value = parts[1].trim();
        
        value = removeQuotes(value);
        setSystemPropertyIfNotExists(key, value);
    }
    
    private static boolean isValidEnvLine(String line) {
        return !line.startsWith("#") && line.contains("=");
    }
    
    private static String removeQuotes(String value) {
        if (isWrappedInQuotes(value, "\"") || isWrappedInQuotes(value, "'")) {
            return value.substring(1, value.length() - 1);
        }
        return value;
    }
    
    private static boolean isWrappedInQuotes(String value, String quote) {
        return value.startsWith(quote) && value.endsWith(quote);
    }
    
    private static void setSystemPropertyIfNotExists(String key, String value) {
        if (System.getProperty(key) == null) {
            System.setProperty(key, value);
        }
    }
}


