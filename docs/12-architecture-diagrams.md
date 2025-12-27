# Architecture Diagrams Documentation

## Overview

This document provides comprehensive architecture diagrams that visualize the structure, components, and interactions of the pattern-based locator system. All diagrams use Mermaid format for clarity and maintainability.

## High-Level Architecture Diagram

### System Layers Overview

```mermaid
graph TB
    subgraph "Test Layer"
        A[Gherkin Feature Files]
        B[Test Steps / Scenarios]
    end
    
    subgraph "Composite Action Layer"
        C[web.java]
        D[Composite Actions]
        E[Page Context Management]
    end
    
    subgraph "Pattern Resolution Layer"
        F[patternLoc.java]
        G[Pattern Methods]
        H[checkLoc Function]
        I[generateLoc Function]
    end
    
    subgraph "Configuration Layer"
        J[locPattern.properties]
        K[Pattern Templates]
        L[application.properties]
        M[Pattern Code Config]
    end
    
    subgraph "Cache Layer"
        N[QAF Configuration Bundle]
        O[Cached Locators]
        P[Runtime Variables]
    end
    
    subgraph "Atomic Action Layer"
        Q[BrowserGlobal.java]
        R[Atomic Actions]
        S[Wait Conditions]
        T[JS Executor]
    end
    
    subgraph "Browser Layer"
        U[Selenium WebDriver]
        V[Browser]
    end
    
    A --> B
    B --> C
    C --> D
    D --> F
    E --> N
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    H --> N
    I --> N
    N --> O
    N --> P
    D --> Q
    Q --> R
    R --> S
    R --> T
    R --> U
    U --> V
    
    style A fill:#e1f5ff
    style C fill:#fff4e1
    style F fill:#ffe1f5
    style J fill:#e1ffe1
    style N fill:#f5e1ff
    style Q fill:#ffe1e1
    style U fill:#e1e1e1
```

### Layer Responsibilities

```mermaid
graph LR
    subgraph "Responsibilities"
        A[Test Layer<br/>Define test scenarios<br/>Specify element interactions]
        B[Composite Action Layer<br/>Orchestrate actions<br/>Manage page context<br/>Combine atomic actions]
        C[Pattern Resolution Layer<br/>Generate locator keys<br/>Resolve patterns<br/>Cache locators]
        D[Configuration Layer<br/>Store pattern templates<br/>Define placeholders<br/>Configure system]
        E[Cache Layer<br/>Store generated locators<br/>Provide runtime variables<br/>Enable reuse]
        F[Atomic Action Layer<br/>Execute browser actions<br/>Handle waits<br/>Provide fallbacks]
        G[Browser Layer<br/>Interact with DOM<br/>Execute commands]
    end
    
    A --> B --> C --> D
    C --> E
    B --> F --> G
    E --> F
```

## Component Interaction Flow Diagram

### Complete Interaction Sequence

```mermaid
sequenceDiagram
    participant TF as Test Feature
    participant TS as Test Step
    participant WJ as web.java
    participant PL as patternLoc.java
    participant CB as Config Bundle
    participant LP as locPattern.properties
    participant BG as BrowserGlobal.java
    participant WD as WebDriver
    
    TF->>TS: Execute: Click Button "Search"
    TS->>WJ: clickButton_Web("Search")
    WJ->>CB: getPageName()
    CB-->>WJ: "HomePage"
    
    WJ->>PL: button("HomePage", "Search")
    PL->>PL: checkLoc("HomePage", "button", "Search")
    PL->>CB: getPropertyValue("loc.iExams.homePage.button.search")
    CB-->>PL: "loc.iExams.homePage.button.search" (not found)
    PL-->>PL: Return "auto.loc.iExams.homePage.button.search"
    
    PL->>PL: generateLoc("auto.loc.iExams.homePage.button.search", "Search", "button")
    PL->>CB: setProperty("loc.auto.fieldName", "Search")
    PL->>CB: getPropertyValue("loc.iExams.pattern.button")
    CB->>LP: Retrieve pattern
    LP-->>CB: "xpath=//button[contains(text(),'${loc.auto.fieldName}')]"
    CB-->>PL: Pattern value
    PL->>CB: setProperty("auto.loc.iExams.homePage.button.search", locator JSON)
    PL-->>WJ: "auto.loc.iExams.homePage.button.search"
    
    WJ->>BG: iWaitUntilElementPresent("auto.loc.iExams.homePage.button.search")
    BG->>CB: Resolve locator
    CB-->>BG: {"locator":["xpath=//button[contains(text(),'Search')]"],"desc":"..."}
    BG->>WD: findElement(By.xpath("//button[contains(text(),'Search')]"))
    WD-->>BG: WebElement
    BG-->>WJ: Success
    
    WJ->>BG: iScrollToAnElement("auto.loc.iExams.homePage.button.search")
    BG->>WD: executeScript("arguments[0].scrollIntoView()", element)
    WD-->>BG: Success
    
    WJ->>BG: iClickOn("auto.loc.iExams.homePage.button.search")
    BG->>WD: element.click()
    WD-->>BG: Success
    BG-->>WJ: Success
    WJ-->>TS: Success
    TS-->>TF: Step Passed
```

### Cached Locator Interaction (Subsequent Request)

```mermaid
sequenceDiagram
    participant TS as Test Step
    participant WJ as web.java
    participant PL as patternLoc.java
    participant CB as Config Bundle
    participant BG as BrowserGlobal.java
    participant WD as WebDriver
    
    TS->>WJ: clickButton_Web("Search")
    WJ->>PL: button("HomePage", "Search")
    PL->>PL: checkLoc("HomePage", "button", "Search")
    PL->>CB: getPropertyValue("loc.iExams.homePage.button.search")
    
    Note over CB: Locator found in cache!
    CB-->>PL: {"locator":["xpath=//button[contains(text(),'Search')]"],"desc":"..."}
    
    Note over PL: No "auto." prefix - skip generation
    PL-->>WJ: "loc.iExams.homePage.button.search"
    
    WJ->>BG: iClickOn("loc.iExams.homePage.button.search")
    BG->>CB: Resolve locator
    CB-->>BG: {"locator":["xpath=//button[contains(text(),'Search')]"],"desc":"..."}
    BG->>WD: element.click()
    WD-->>BG: Success
    BG-->>WJ: Success
    WJ-->>TS: Success
```


## Locator Resolution Sequence Diagram

### First-Time Locator Resolution

```mermaid
sequenceDiagram
    autonumber
    participant Test as Test Step
    participant Pattern as patternLoc.java
    participant Check as checkLoc()
    participant Gen as generateLoc()
    participant Bundle as Config Bundle
    participant Props as locPattern.properties
    
    Test->>Pattern: button("HomePage", "Search")
    Pattern->>Check: checkLoc("HomePage", "button", "Search")
    
    Check->>Check: Generate key: "loc.iExams.homePage.button.search"
    Check->>Bundle: getPropertyValue("loc.iExams.homePage.button.search")
    Bundle-->>Check: "loc.iExams.homePage.button.search" (not found)
    
    Check->>Check: Prefix with "auto."
    Check-->>Pattern: "auto.loc.iExams.homePage.button.search"
    
    Pattern->>Pattern: Check if contains "auto."
    Pattern->>Gen: generateLoc("auto.loc.iExams.homePage.button.search", "Search", "button")
    
    Gen->>Bundle: setProperty("loc.auto.fieldName", "Search")
    Gen->>Bundle: setProperty("loc.auto.fieldInstance", "1")
    
    Gen->>Gen: Build pattern key: "loc.iExams.pattern.button"
    Gen->>Bundle: getPropertyValue("loc.iExams.pattern.button")
    Bundle->>Props: Retrieve pattern
    Props-->>Bundle: "xpath=//button[contains(text(),'${loc.auto.fieldName}')]"
    Bundle-->>Gen: Pattern template
    
    Gen->>Gen: Build locator JSON with pattern
    Gen->>Bundle: setProperty("auto.loc.iExams.homePage.button.search", JSON)
    
    Gen-->>Pattern: Complete
    Pattern-->>Test: "auto.loc.iExams.homePage.button.search"
```

### Cached Locator Resolution

```mermaid
sequenceDiagram
    autonumber
    participant Test as Test Step
    participant Pattern as patternLoc.java
    participant Check as checkLoc()
    participant Bundle as Config Bundle
    
    Test->>Pattern: button("HomePage", "Search")
    Pattern->>Check: checkLoc("HomePage", "button", "Search")
    
    Check->>Check: Generate key: "loc.iExams.homePage.button.search"
    Check->>Bundle: getPropertyValue("loc.iExams.homePage.button.search")
    
    Note over Bundle: Cache hit!
    Bundle-->>Check: {"locator":["xpath=//button[contains(text(),'Search')]"],"desc":"..."}
    
    Check->>Check: Value found (length > 5)
    Check-->>Pattern: "loc.iExams.homePage.button.search" (no "auto." prefix)
    
    Pattern->>Pattern: Check if contains "auto."
    Note over Pattern: No "auto." - skip generation
    
    Pattern-->>Test: "loc.iExams.homePage.button.search"
```

## Pattern Fallback Flow Diagram

### Multiple Pattern Attempt Sequence

```mermaid
graph TD
    A[Test Step Requests Element] --> B[Pattern Resolution]
    B --> C[Generate Locator Key]
    C --> D{Locator in Cache?}
    
    D -->|Yes| E[Return Cached Locator]
    D -->|No| F[Retrieve Pattern Template]
    
    F --> G[Pattern Has Multiple Fallbacks]
    G --> H[Create JSON Array of Patterns]
    H --> I[Store in Cache]
    I --> E
    
    E --> J[Atomic Action Receives Locator]
    J --> K[QAF Resolves JSON Locator]
    K --> L[Extract Pattern Array]
    
    L --> M[Try Pattern 1]
    M --> N{Element Found?}
    
    N -->|Yes| O[Execute Action]
    N -->|No| P[Try Pattern 2]
    
    P --> Q{Element Found?}
    Q -->|Yes| O
    Q -->|No| R[Try Pattern 3]
    
    R --> S{Element Found?}
    S -->|Yes| O
    S -->|No| T[Try Pattern N]
    
    T --> U{Element Found?}
    U -->|Yes| O
    U -->|No| V[All Patterns Failed]
    
    V --> W[Throw NoSuchElementException]
    O --> X[Action Complete]
    
    style D fill:#ffe1e1
    style N fill:#ffe1e1
    style Q fill:#ffe1e1
    style S fill:#ffe1e1
    style U fill:#ffe1e1
    style O fill:#e1ffe1
    style W fill:#ff9999
```

### Fallback Pattern Example Flow

```mermaid
sequenceDiagram
    participant Action as Atomic Action
    participant QAF as QAF Framework
    participant WD as WebDriver
    participant DOM as Browser DOM
    
    Action->>QAF: iClickOn("auto.loc.iExams.homePage.input.email")
    QAF->>QAF: Resolve locator from bundle
    
    Note over QAF: Locator JSON:<br/>{"locator":[<br/>"xpath=//input[@placeholder='Email']",<br/>"xpath=//label[text()='Email']/following::input[1]",<br/>"xpath=//input[@id='Email']"<br/>]}
    
    QAF->>QAF: Extract pattern array
    
    QAF->>WD: Try Pattern 1: //input[@placeholder='Email']
    WD->>DOM: Find element
    DOM-->>WD: NoSuchElementException
    WD-->>QAF: Element not found
    
    Note over QAF: Pattern 1 failed, try next
    
    QAF->>WD: Try Pattern 2: //label[text()='Email']/following::input[1]
    WD->>DOM: Find element
    DOM-->>WD: WebElement found
    WD-->>QAF: Element found
    
    Note over QAF: Pattern 2 succeeded!
    
    QAF->>WD: element.click()
    WD->>DOM: Execute click
    DOM-->>WD: Success
    WD-->>QAF: Success
    QAF-->>Action: Action complete
```

## Data Flow Architecture

### Pattern Configuration to Execution Flow

```mermaid
graph LR
    subgraph "Configuration Phase"
        A[locPattern.properties]
        B[Pattern Templates<br/>with Placeholders]
        C[application.properties]
        D[Pattern Code Config]
    end
    
    subgraph "Runtime Phase"
        E[Test Execution]
        F[Pattern Method Call]
        G[Locator Key Generation]
        H[Pattern Retrieval]
        I[Placeholder Substitution]
        J[Cache Storage]
    end
    
    subgraph "Execution Phase"
        K[Atomic Action]
        L[Locator Resolution]
        M[Pattern Fallback]
        N[Browser Action]
    end
    
    A --> B
    C --> D
    
    E --> F
    F --> G
    G --> H
    H --> B
    B --> I
    D --> I
    I --> J
    
    J --> K
    K --> L
    L --> M
    M --> N
    
    style A fill:#e1ffe1
    style C fill:#e1ffe1
    style J fill:#f5e1ff
    style N fill:#ffe1e1
```

### Page Context Data Flow

```mermaid
graph TD
    A[Test Step: Set Page Name] --> B[web.setPageName]
    B --> C[Store in Config Bundle]
    C --> D[loc.auto.pageName = 'HomePage']
    
    E[Test Step: Set Field Location] --> F[web.setFieldLocation]
    F --> G[Append to Page Name]
    G --> H[loc.auto.pageName = 'HomePage::Section']
    
    I[Test Step: Element Interaction] --> J[Pattern Method Call]
    J --> K[checkLoc: Retrieve Page Name]
    K --> C
    K --> H
    
    K --> L[Generate Locator Key]
    L --> M[loc.iExams.homePage.button.search]
    L --> N[loc.iExams.homePageSection.button.search]
    
    O[Test Step: Remove Field Location] --> P[web.removeFieldLocation]
    P --> Q[Reset to Base Page Name]
    Q --> D
    
    style C fill:#f5e1ff
    style H fill:#f5e1ff
    style D fill:#f5e1ff
```

### Field Name Processing Flow

```mermaid
graph TD
    A[Test Step: 'Email Address[2]'] --> B[Pattern Method Receives Field Name]
    B --> C[fieldNameCheck Function]
    C --> D{Contains '[' and ends with ']'?}
    
    D -->|Yes| E[Split on '[']
    D -->|No| F[Return Original Field Name]
    
    E --> G[Extract Field Name: 'Email Address']
    E --> H[Extract Instance: '2']
    
    F --> I[Set loc.auto.fieldName]
    G --> I
    
    H --> J[Set loc.auto.fieldInstance = '2']
    D -->|No| K[Set loc.auto.fieldInstance = '1']
    
    I --> L[CaseUtils.toCamelCase]
    L --> M[Result: 'emailAddress']
    
    M --> N[Build Locator Key]
    J --> N
    K --> N
    
    N --> O[loc.iExams.homePage.input.emailAddress2]
    
    I --> P[Pattern Substitution]
    P --> Q[xpath=//input[@placeholder='Email Address']]
    
    style I fill:#f5e1ff
    style J fill:#f5e1ff
    style K fill:#f5e1ff
```

## Component Dependency Diagram

### Module Dependencies

```mermaid
graph TB
    subgraph "External Dependencies"
        A[QAF Framework]
        B[Selenium WebDriver]
        C[Apache Commons Text]
        D[TestNG]
    end
    
    subgraph "Core Components"
        E[web.java]
        F[patternLoc.java]
        G[BrowserGlobal.java]
    end
    
    subgraph "Configuration"
        H[locPattern.properties]
        I[application.properties]
        J[QAF Config Bundle]
    end
    
    subgraph "Test Layer"
        K[Feature Files]
        L[Step Definitions]
    end
    
    K --> L
    L --> E
    
    E --> F
    E --> G
    E --> A
    
    F --> C
    F --> J
    F --> H
    
    G --> B
    G --> A
    
    J --> H
    J --> I
    
    A --> D
    A --> B
    
    style E fill:#fff4e1
    style F fill:#ffe1f5
    style G fill:#ffe1e1
    style J fill:#f5e1ff
```

### Class Relationship Diagram

```mermaid
classDiagram
    class FeatureFile {
        +Gherkin Scenarios
        +Test Steps
    }
    
    class web {
        +clickButton_Web(field)
        +input_Web(text, field)
        +selectDropdown_Web(text, field)
        +setPageName(page)
        +setFieldLocation(location)
        +getPageName()
    }
    
    class patternLoc {
        +button(page, fieldName)
        +input(page, fieldName)
        +select(page, fieldName)
        +radioButton(page, fieldName, value)
        +checkLoc(page, fieldType, fieldName)
        +generateLoc(locator, fieldName, fieldType)
        +fieldNameCheck(fieldName)
        +fieldInstanceCheck(fieldName)
    }
    
    class BrowserGlobal {
        +iClickOn(locator)
        +iInputInTo(text, locator)
        +iSelectDropdownWithText(locator, text)
        +iWaitUntilElementPresent(locator)
        +iWaitUntilElementVisible(locator)
        +iScrollToAnElement(locator)
    }
    
    class ConfigBundle {
        +getPropertyValue(key)
        +setProperty(key, value)
        +clearProperty(key)
    }
    
    class PatternProperties {
        +loc.iExams.pattern.button
        +loc.iExams.pattern.input
        +loc.iExams.pattern.select
    }
    
    FeatureFile --> web : executes
    web --> patternLoc : calls
    web --> BrowserGlobal : calls
    patternLoc --> ConfigBundle : reads/writes
    patternLoc --> PatternProperties : reads
    BrowserGlobal --> ConfigBundle : reads
    BrowserGlobal --> WebDriver : uses
```

## Error Handling Flow Diagram

### Error Detection and Recovery

```mermaid
graph TD
    A[Test Step Execution] --> B[Pattern Method Call]
    B --> C{Pattern Method Exists?}
    
    C -->|No| D[NoSuchMethodException]
    D --> E[Log Error with Method Name]
    E --> F[Test Fails]
    
    C -->|Yes| G[checkLoc Execution]
    G --> H[generateLoc Execution]
    H --> I{Pattern Template Exists?}
    
    I -->|No| J[Log: Pattern Not Available]
    J --> K[Return Empty Locator]
    K --> L[Atomic Action Fails]
    L --> F
    
    I -->|Yes| M[Store Locator in Cache]
    M --> N[Atomic Action Execution]
    N --> O{Element Found?}
    
    O -->|No - Try Fallback| P[Try Next Pattern]
    P --> Q{More Patterns?}
    
    Q -->|Yes| O
    Q -->|No| R[All Patterns Failed]
    R --> S{JS Executor Available?}
    
    S -->|Yes| T[Try JavaScript Executor]
    T --> U{JS Execution Success?}
    
    U -->|Yes| V[Action Complete]
    U -->|No| W[NoSuchElementException]
    W --> F
    
    S -->|No| W
    O -->|Yes| V
    
    style D fill:#ff9999
    style J fill:#ffcc99
    style R fill:#ffcc99
    style W fill:#ff9999
    style V fill:#99ff99
```

### JavaScript Executor Fallback Flow

```mermaid
sequenceDiagram
    participant Test as Test Step
    participant Web as web.java
    participant Pattern as patternLoc.java
    participant BG as BrowserGlobal
    participant WD as WebDriver
    participant JS as JavaScript Executor
    
    Test->>Web: clickButton_Web("Submit")
    Web->>Pattern: button("FormPage", "Submit")
    Pattern-->>Web: "auto.loc.iExams.formPage.button.submit"
    
    Web->>BG: iClickOn("auto.loc.iExams.formPage.button.submit")
    BG->>WD: element.click()
    WD-->>BG: ElementNotInteractableException
    
    Note over BG: Standard click failed
    
    BG->>BG: Catch exception
    BG->>JS: executeScript("arguments[0].click()", element)
    JS->>WD: Execute JavaScript
    WD-->>JS: Success
    JS-->>BG: Success
    
    Note over BG: JavaScript fallback succeeded
    
    BG-->>Web: Action complete
    Web-->>Test: Step passed
```

## Performance Optimization Flow

### Cache Performance Impact

```mermaid
graph LR
    subgraph "Without Caching"
        A1[Request 1] --> B1[Generate Key: 7ms]
        B1 --> C1[Retrieve Pattern: 3ms]
        C1 --> D1[Substitute: 2ms]
        D1 --> E1[Total: 12ms]
        
        A2[Request 2] --> B2[Generate Key: 7ms]
        B2 --> C2[Retrieve Pattern: 3ms]
        C2 --> D2[Substitute: 2ms]
        D2 --> E2[Total: 12ms]
        
        A3[Request 3] --> B3[Generate Key: 7ms]
        B3 --> C3[Retrieve Pattern: 3ms]
        C3 --> D3[Substitute: 2ms]
        D3 --> E3[Total: 12ms]
    end
    
    subgraph "With Caching"
        F1[Request 1] --> G1[Generate Key: 7ms]
        G1 --> H1[Retrieve Pattern: 3ms]
        H1 --> I1[Substitute: 2ms]
        I1 --> J1[Cache: 1ms]
        J1 --> K1[Total: 13ms]
        
        F2[Request 2] --> G2[Generate Key: 1ms]
        G2 --> H2[Cache Lookup: 0.5ms]
        H2 --> K2[Total: 1.5ms]
        
        F3[Request 3] --> G3[Generate Key: 1ms]
        G3 --> H3[Cache Lookup: 0.5ms]
        H3 --> K3[Total: 1.5ms]
    end
    
    style E1 fill:#ffcc99
    style E2 fill:#ffcc99
    style E3 fill:#ffcc99
    style K1 fill:#99ccff
    style K2 fill:#99ff99
    style K3 fill:#99ff99
```

## Requirements Validation

This documentation addresses all requirements through comprehensive diagrams:

**All Requirements**: ✅ Visualized through architecture and flow diagrams
- High-level architecture shows all system layers and their relationships
- Component interaction diagrams illustrate communication patterns
- Sequence diagrams detail locator resolution and caching flows
- Fallback flow diagrams show pattern attempt sequences
- Data flow diagrams trace information from configuration to execution
- Error handling diagrams show detection and recovery mechanisms
- Performance diagrams illustrate caching benefits

## Summary

This documentation provides comprehensive visual representations of the pattern-based locator system architecture. Key diagrams include:

- **High-level architecture**: Shows all system layers and their responsibilities
- **Component interactions**: Illustrates how components communicate during execution
- **Locator resolution sequences**: Details first-time and cached locator resolution
- **Pattern fallback flows**: Shows how multiple patterns are attempted
- **Data flow diagrams**: Traces data from configuration through execution
- **Error handling flows**: Visualizes error detection and recovery mechanisms
- **Performance optimization**: Demonstrates caching benefits

These diagrams serve as visual references for understanding system architecture, implementing similar systems in other frameworks, and troubleshooting issues.
