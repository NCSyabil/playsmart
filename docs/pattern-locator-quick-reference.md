# Pattern Locator System - Quick Reference

## Configuration

```typescript
// resources/config.ts
patternIq: {
  enable: true,                    // Enable pattern system
  config: "homePage",              // Default page object
  retryTimeout: 30000,             // Max retry time (ms)
  retryInterval: 2000,             // Retry interval (ms)
  pageMapping: {                   // URL → Page Object mapping
    "/login": "loginPage",
    "/home": "homePage",
    "/checkout": "checkoutPage"
  }
}
```

## Pattern File Structure

```typescript
// resources/locators/pattern/{pageName}.pattern.ts
export const pageName = {
  fields: {
    button: "xpath;css",           // Semicolon-separated patterns
    input: "xpath;css",
    link: "xpath;css"
  },
  sections: {
    "Section Name": "xpath;css"
  },
  locations: {
    "Location Name": "xpath;css"
  },
  scroll: "xpath;css"              // Optional scroll container
};
```

## Runtime Variables

| Variable | Description |
|----------|-------------|
| `#{loc.auto.fieldName}` | Field name as provided |
| `#{loc.auto.fieldName.toLowerCase}` | Lowercase field name |
| `#{loc.auto.forId}` | Extracted "for" attribute |
| `#{loc.auto.fieldInstance}` | Instance number (default: "1") |
| `#{loc.auto.section.name}` | Section name |
| `#{loc.auto.location.name}` | Location name |

## Field Name Syntax

```typescript
// Basic
"Username"

// With instance
"Submit[2]"

// With section
"{Login Form} Username"

// With location and section
"{{Main Content}} {Login Form} Username"
```

## Usage in Tests

```typescript
// Automatic page detection (via URL mapping)
await page.goto('/login');
await fill(page, 'Username', 'john.doe');

// Explicit page object
await fill(page, 'Email', 'test@example.com', { pattern: 'loginPage' });

// With section
await fill(page, '{Billing Info} Card Number', '4111111111111111');

// With location and section
await clickButton(page, '{{Main}} {Form} Submit');
```

## Common Patterns

### Button
```typescript
button: "//button[text()='#{loc.auto.fieldName}'];" +
        "//button[@aria-label='#{loc.auto.fieldName}'];" +
        "button:has-text('#{loc.auto.fieldName}')"
```

### Input
```typescript
input: "//input[@id='#{loc.auto.forId}'];" +
       "//input[@placeholder='#{loc.auto.fieldName}'];" +
       "//input[@name='#{loc.auto.fieldName.toLowerCase}'];" +
       "input[placeholder='#{loc.auto.fieldName}']"
```

### Link
```typescript
link: "//a[text()='#{loc.auto.fieldName}'];" +
      "//a[@title='#{loc.auto.fieldName}'];" +
      "a:has-text('#{loc.auto.fieldName}')"
```

### Select
```typescript
select: "//select[@name='#{loc.auto.fieldName.toLowerCase}'];" +
        "select[name='#{loc.auto.fieldName.toLowerCase}']"
```

### Checkbox
```typescript
checkbox: "//input[@type='checkbox'][@name='#{loc.auto.fieldName.toLowerCase}'];" +
          "input[type='checkbox'][name='#{loc.auto.fieldName.toLowerCase}']"
```

### Label (for label-based resolution)
```typescript
label: "//label[text()='#{loc.auto.fieldName}'];" +
       "//label[contains(text(), '#{loc.auto.fieldName}')];" +
       "label:has-text('#{loc.auto.fieldName}')"
```

## Page Object Selection Priority

1. **Explicit** (highest): `{ pattern: 'loginPage' }`
2. **URL Mapping**: `pageMapping: { "/login": "loginPage" }`
3. **Default** (lowest): `config: "homePage"`

## Troubleshooting

### Element Not Found
- ✅ Verify pattern syntax
- ✅ Check page object is correct
- ✅ Increase retry timeout
- ✅ Add more fallback patterns

### Wrong Element Selected
- ✅ Make patterns more specific
- ✅ Use instance numbers: `Button[2]`
- ✅ Use sections/locations to scope
- ✅ Reorder patterns (most specific first)

### Slow Resolution
- ✅ Reduce retry timeout
- ✅ Optimize patterns (use CSS over XPath)
- ✅ Reduce fallback patterns

### Pattern Not Loading
- ✅ Check file name: `{pageName}.pattern.ts`
- ✅ Check location: `resources/locators/pattern/`
- ✅ Verify export: `export const {pageName}`
- ✅ Restart test runner

## Best Practices

1. ✅ Use semicolon-separated patterns (not arrays)
2. ✅ Order patterns by specificity (most specific first)
3. ✅ Mix XPath and CSS for better compatibility
4. ✅ Use lowercase variables for attributes
5. ✅ Always define label patterns for form elements
6. ✅ Use URL mapping for automatic page detection
7. ✅ Document complex patterns with comments
8. ✅ Test patterns independently before integration

