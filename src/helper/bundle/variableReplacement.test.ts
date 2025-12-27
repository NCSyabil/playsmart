import * as path from "path";

/**
 * Unit Tests for Variable Replacement
 * Feature: cucumber-integration
 * 
 * Tests the variable replacement functionality used in Cucumber step definitions
 * to resolve variables like #{baseUrl}, #{username}, etc.
 */

// Set up environment variables before importing vars module
process.env.PLAYQ_CORE_ROOT = path.resolve(process.cwd(), "src");
process.env.PLAYQ_PROJECT_ROOT = process.cwd();

import { initVars, getValue, setValue, replaceVariables } from "./vars";

describe("Variable Replacement - Unit Tests", () => {
  beforeEach(() => {
    // Initialize vars before each test
    initVars();
  });

  describe("Simple variable replacement", () => {
    /**
     * Test simple variable replacement with #{var} syntax
     * Requirements: 6.1
     */
    test("should replace simple variable with its value", () => {
      // Set a test variable
      setValue("testVar", "testValue");
      
      // Replace variable in string
      const input = "Hello #{testVar}!";
      const result = replaceVariables(input);
      
      expect(result).toBe("Hello testValue!");
    });

    test("should replace multiple variables in a string", () => {
      setValue("firstName", "John");
      setValue("lastName", "Doe");
      
      const input = "Name: #{firstName} #{lastName}";
      const result = replaceVariables(input);
      
      expect(result).toBe("Name: John Doe");
    });

    test("should replace variable at start of string", () => {
      setValue("greeting", "Hello");
      
      const input = "#{greeting} World";
      const result = replaceVariables(input);
      
      expect(result).toBe("Hello World");
    });

    test("should replace variable at end of string", () => {
      setValue("name", "Alice");
      
      const input = "Hello #{name}";
      const result = replaceVariables(input);
      
      expect(result).toBe("Hello Alice");
    });

    test("should handle variable as entire string", () => {
      setValue("url", "https://example.com");
      
      const input = "#{url}";
      const result = replaceVariables(input);
      
      expect(result).toBe("https://example.com");
    });
  });

  describe("Nested variables", () => {
    /**
     * Test nested variable replacement
     * Requirements: 6.1
     */
    test("should replace nested variables with dot notation", () => {
      setValue("config.baseUrl", "https://example.com");
      setValue("config.port", "8080");
      
      const input = "URL: #{config.baseUrl}:#{config.port}";
      const result = replaceVariables(input);
      
      expect(result).toBe("URL: https://example.com:8080");
    });

    test("should handle deeply nested variables", () => {
      setValue("app.config.server.host", "localhost");
      setValue("app.config.server.port", "3000");
      
      const input = "Server: #{app.config.server.host}:#{app.config.server.port}";
      const result = replaceVariables(input);
      
      expect(result).toBe("Server: localhost:3000");
    });

    test("should handle variables with underscores in nested paths", () => {
      setValue("test_data.user_info.email", "test@example.com");
      
      const input = "Email: #{test_data.user_info.email}";
      const result = replaceVariables(input);
      
      expect(result).toBe("Email: test@example.com");
    });
  });

  describe("Missing variables", () => {
    /**
     * Test behavior when variables are not found
     * Requirements: 6.1
     */
    test("should return variable name when variable is not found", () => {
      const input = "Value: #{nonExistentVar}";
      const result = replaceVariables(input);
      
      // When variable is not found, it returns the variable name
      expect(result).toBe("Value: nonExistentVar");
    });

    test("should handle multiple missing variables", () => {
      const input = "#{missing1} and #{missing2}";
      const result = replaceVariables(input);
      
      expect(result).toBe("missing1 and missing2");
    });

    test("should replace found variables and leave missing ones as names", () => {
      setValue("found", "value");
      
      const input = "Found: #{found}, Missing: #{missing}";
      const result = replaceVariables(input);
      
      expect(result).toBe("Found: value, Missing: missing");
    });

    test("should handle empty variable name", () => {
      const input = "Empty: #{}";
      const result = replaceVariables(input);
      
      // Empty variable name should remain unchanged
      expect(result).toBe("Empty: #{}");
    });
  });

  describe("Special characters in variables", () => {
    /**
     * Test variable replacement with special characters
     * Requirements: 6.1
     */
    test("should handle variables with special characters in values", () => {
      setValue("specialChars", "Hello@World!#$%");
      
      const input = "Value: #{specialChars}";
      const result = replaceVariables(input);
      
      expect(result).toBe("Value: Hello@World!#$%");
    });

    test("should handle variables with URLs containing special characters", () => {
      setValue("apiUrl", "https://api.example.com/v1/users?id=123&name=test");
      
      const input = "API: #{apiUrl}";
      const result = replaceVariables(input);
      
      expect(result).toBe("API: https://api.example.com/v1/users?id=123&name=test");
    });

    test("should handle variables with JSON-like values", () => {
      setValue("jsonData", '{"key": "value", "number": 123}');
      
      const input = "Data: #{jsonData}";
      const result = replaceVariables(input);
      
      expect(result).toBe('Data: {"key": "value", "number": 123}');
    });

    test("should handle variables with newlines and tabs", () => {
      setValue("multiline", "Line1\nLine2\tTabbed");
      
      const input = "Text: #{multiline}";
      const result = replaceVariables(input);
      
      expect(result).toBe("Text: Line1\nLine2\tTabbed");
    });

    test("should handle variables with quotes", () => {
      setValue("quoted", 'He said "Hello"');
      
      const input = "Quote: #{quoted}";
      const result = replaceVariables(input);
      
      expect(result).toBe('Quote: He said "Hello"');
    });

    test("should handle variables with single quotes", () => {
      setValue("singleQuoted", "It's working");
      
      const input = "Message: #{singleQuoted}";
      const result = replaceVariables(input);
      
      expect(result).toBe("Message: It's working");
    });

    test("should handle variables with backslashes", () => {
      setValue("path", "C:\\Users\\Test\\file.txt");
      
      const input = "Path: #{path}";
      const result = replaceVariables(input);
      
      expect(result).toBe("Path: C:\\Users\\Test\\file.txt");
    });

    test("should handle variables with unicode characters", () => {
      setValue("unicode", "Hello 世界 🌍");
      
      const input = "Message: #{unicode}";
      const result = replaceVariables(input);
      
      expect(result).toBe("Message: Hello 世界 🌍");
    });
  });

  describe("Environment variables", () => {
    /**
     * Test environment variable resolution with env. prefix
     * Requirements: 6.1, 6.2
     */
    test("should resolve environment variables with env. prefix", () => {
      // Set an environment variable
      process.env.TEST_ENV_VAR = "envValue";
      
      const input = "Env: #{env.TEST_ENV_VAR}";
      const result = replaceVariables(input);
      
      expect(result).toBe("Env: envValue");
      
      // Cleanup
      delete process.env.TEST_ENV_VAR;
    });

    test("should handle missing environment variables", () => {
      const input = "Env: #{env.MISSING_ENV_VAR}";
      const result = replaceVariables(input);
      
      // Missing env vars return the key name
      expect(result).toBe("Env: env.MISSING_ENV_VAR");
    });

    test("should prioritize environment variables over stored variables", () => {
      setValue("env.TEST_VAR", "storedValue");
      process.env.TEST_VAR = "envValue";
      
      const input = "Value: #{env.TEST_VAR}";
      const result = replaceVariables(input);
      
      // Environment variable should take precedence
      expect(result).toBe("Value: envValue");
      
      // Cleanup
      delete process.env.TEST_VAR;
    });
  });

  describe("Edge cases", () => {
    /**
     * Test edge cases in variable replacement
     * Requirements: 6.1
     */
    test("should handle empty string input", () => {
      const input = "";
      const result = replaceVariables(input);
      
      expect(result).toBe("");
    });

    test("should handle string with no variables", () => {
      const input = "No variables here";
      const result = replaceVariables(input);
      
      expect(result).toBe("No variables here");
    });

    test("should handle consecutive variables", () => {
      setValue("var1", "A");
      setValue("var2", "B");
      
      const input = "#{var1}#{var2}";
      const result = replaceVariables(input);
      
      expect(result).toBe("AB");
    });

    test("should handle variables with spaces in names", () => {
      setValue("var with spaces", "value");
      
      const input = "Value: #{var with spaces}";
      const result = replaceVariables(input);
      
      expect(result).toBe("Value: value");
    });

    test("should handle numeric values", () => {
      setValue("number", "12345");
      
      const input = "Number: #{number}";
      const result = replaceVariables(input);
      
      expect(result).toBe("Number: 12345");
    });

    test("should handle boolean-like values", () => {
      setValue("flag", "true");
      
      const input = "Flag: #{flag}";
      const result = replaceVariables(input);
      
      expect(result).toBe("Flag: true");
    });

    test("should handle non-string input by converting to string", () => {
      const input = 12345;
      const result = replaceVariables(input);
      
      expect(result).toBe("12345");
    });
  });

  describe("Special transformations", () => {
    /**
     * Test special variable transformations like toNumber
     * Requirements: 6.1
     */
    test("should convert variable to number with .(toNumber) suffix", () => {
      setValue("count", "42");
      
      const input = "Count: #{count.(toNumber)}";
      const result = replaceVariables(input);
      
      expect(result).toBe("Count: 42");
      expect(typeof result).toBe("string"); // Result is still a string but contains the number
    });

    test("should handle toNumber with non-numeric value", () => {
      setValue("text", "notANumber");
      
      const input = "Value: #{text.(toNumber)}";
      const result = replaceVariables(input);
      
      // Non-numeric values should return empty string
      expect(result).toBe("Value: ");
    });

    test("should handle toNumber with missing variable", () => {
      const input = "Value: #{missing.(toNumber)}";
      const result = replaceVariables(input);
      
      // Missing variable with toNumber should return empty string
      expect(result).toBe("Value: ");
    });
  });

  describe("Encrypted variables", () => {
    /**
     * Test encrypted variable handling (pwd. and enc. prefixes)
     * Requirements: 6.1
     */
    test("should handle pwd. prefix for encrypted passwords", () => {
      // This test verifies the structure, actual decryption requires crypto setup
      const input = "Password: #{pwd.encryptedValue}";
      const result = replaceVariables(input);
      
      // Without proper crypto setup, it should return the variable name
      expect(result).toContain("pwd.");
    });

    test("should handle enc. prefix for encrypted values", () => {
      // This test verifies the structure, actual decryption requires crypto setup
      const input = "Secret: #{enc.encryptedValue}";
      const result = replaceVariables(input);
      
      // Without proper crypto setup, it should return the variable name
      expect(result).toContain("enc.");
    });
  });
});
