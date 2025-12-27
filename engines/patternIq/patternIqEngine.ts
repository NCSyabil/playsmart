import { Page, Locator } from "@playwright/test";
import { vars, web, logFixture } from '@playq';

const LABEL_ELIGIBLE_TAGS = new Set(['input', 'select', 'textarea']);
// Global variables (adjust as needed)
let locType = "";
let locField = "";
let locFieldName = "";
let locFieldInstance = "";
let locFieldForId = "";

let locSection = "";
let locSectionName = "";
let locSectionValue = "";

let locLocation = "";
let locLocationName = "";
let locLocationValue = "";

let patternVarNameField = "";
let patternVarNameLocation = "";
let patternVarNameSection = "";
let patternVarNameSroll = "";

interface LocatorResult {
  locator: string;
  exists: boolean;
  visible: boolean;
  enabled: boolean;
}

/**
 * Helper function to query a chain locator.
 * If the locator contains ">>", it splits the string into parts and queries sequentially.
 */
function queryChain(context: ParentNode, chainLocator: string): Element | null {
  const parts = chainLocator.split(">>").map(part => part.trim());
  let currentContext: ParentNode | null = context;
  
  for (const part of parts) {
    if (!currentContext) return null;
    let element: Element | null = null;
    
    // If the part is XPath, evaluate using document.evaluate.
    if (part.startsWith("//") || part.startsWith("(")) {
      const res = document.evaluate(
        part,
        currentContext,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      element = res.singleNodeValue as Element | null;
    } else {
      // Otherwise, treat as a CSS selector.
      element = currentContext.querySelector(part);
      // If not found and current context is an Element with shadow DOM, try its shadowRoot.
      if (!element && currentContext instanceof Element && currentContext.shadowRoot) {
        element = currentContext.shadowRoot.querySelector(part);
      }
    }
    
    if (!element) return null;
    currentContext = element;
  }
  
  // Ensure the final context is an Element before returning.
  if (currentContext instanceof Element) {
    return currentContext;
  }
  return null;
}

/**
 * Helper function to query an element.
 * If the selector contains ">>", it delegates to queryChain.
 */
function queryElement(context: ParentNode, selector: string): Element | null {
  selector = selector.trim();
  if (selector.includes(">>")) {
    return queryChain(context, selector);
  }
  if (selector.startsWith("//") || selector.startsWith("(")) {
    const res = document.evaluate(
      selector,
      context,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return res.singleNodeValue as Element | null;
  } else {
    return context.querySelector(selector);
  }
}

/**
 * Evaluates the chained locator on the page.
 * It applies locationLocator (if provided), then sectionLocator (if provided),
 * then the fieldLocator. If fieldLocator contains a chain (using ">>"),
 * queryChain is used.
 */
async function evaluateChainedLocator(
  page: Page,
  locationLocator: string | null,
  sectionLocator: string | null,
  fieldLocator: string,
  isLabelCheck: boolean
): Promise<LocatorResult> {
  // Wait for the page to load completely.

  // const page = webFixture.getCurrentPage();
  await page.waitForLoadState("load");
  console.log(
    `⏳ Processing - locationLocator: ${locationLocator}, sectionLocator: ${sectionLocator}, fieldLocator: ${fieldLocator}, isLabelCheck: ${isLabelCheck}`
  );
  if (page.isClosed()) {
    console.warn("️ Cannot evaluate locator: Page is already closed.");
    return { locator: "", exists: false, visible: false, enabled: false };
  }
  let result;
  try {
    result = await page.evaluate((args: {
      locationLocator: string | null;
      sectionLocator: string | null;
      fieldLocator: string;
      isLabelCheck: boolean;
    }): { chain: string; forAttr: string } => {
      const { locationLocator, sectionLocator, fieldLocator, isLabelCheck } = args;
  
      function queryChain(context: ParentNode, chain: string): Element | null {
        const parts = chain.split(">>").map(p => p.trim());
        let current: ParentNode | null = context;
        for (const part of parts) {
          if (!current) return null;
          let el: Element | null = current.querySelector(part);
          if (!el && current instanceof Element && current.shadowRoot) {
            el = current.shadowRoot.querySelector(part);
          }
          if (!el) return null;
          current = el;
        }
        return current instanceof Element ? current : null;
      }
  
      function queryElement(context: ParentNode, selector: string): Element | null {
        selector = selector.trim();
        if (selector.includes(">>")) return queryChain(context, selector);
        if (selector.startsWith("//") || selector.startsWith("(")) {
          const res = document.evaluate(
            selector, context, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
          );
          return res.singleNodeValue as Element | null;
        }
        return context.querySelector(selector);
      }
  
      let currentContext: ParentNode | Document = document;
      if (locationLocator) {
        const locEl = queryElement(document, locationLocator);
        if (!locEl) return { chain: "", forAttr: "" };
        currentContext = locEl;
      }
  
      if (sectionLocator) {
        const secEl = queryElement(currentContext, sectionLocator);
        if (!secEl) return { chain: "", forAttr: "" };
        currentContext = secEl;
      }
  
      const fieldEl = queryElement(currentContext, fieldLocator);
      if (!fieldEl) return { chain: "", forAttr: "" };
  
      if (fieldEl instanceof HTMLElement) {
        const style = window.getComputedStyle(fieldEl);
        const isVisible =
          fieldEl.offsetParent !== null &&
          style.visibility !== "hidden" &&
          style.display !== "none";
        if (!isVisible) return { chain: "", forAttr: "" };
      }
  
      const parts: string[] = [];
      if (locationLocator) parts.push(locationLocator.trim());
      if (sectionLocator) parts.push(sectionLocator.trim());
      parts.push(fieldLocator.trim());
  
      const forAttr = isLabelCheck && fieldEl instanceof HTMLElement
        ? fieldEl.getAttribute("for") || ""
        : "";
  
      return { chain: parts.join(" >> "), forAttr };
    }, { locationLocator, sectionLocator, fieldLocator, isLabelCheck });
  } catch (err) {
    console.warn("️ Failed to evaluate locator. Reason:", (err as Error).message);
    return { locator: "", exists: false, visible: false, enabled: false };
  }

  
  if (isLabelCheck) {
    locFieldForId = result.forAttr;
    console.log(`<<<<<< result.forAttr >>>>>>>>>>: ${result.forAttr}`);
  }
  console.log(`<<<<<< result.chain >>>>>>>>>>: ${result.chain}`);

  return {
    locator: result.chain,
    exists: result.chain !== "",
    visible: result.chain !== "",
    enabled: true,
  };
}

/**
 * Returns updated locator entries after replacing placeholders with global values.
 * Loads patterns from the specified page object namespace.
 * 
 * @param argType - Element type (button, input, link, etc.)
 * @returns Array of pattern template strings from the active page object
 */
async function getLocatorEntries(argType: string): Promise<string[]> {

  const preprocessed = locField
    .replace(/\/\{\{/g, "$1$")
    .replace(/\/\{/g, "$2$")
    .replace(/\/\[/g, "$3$");

  const pattern = /^(?:{{([^:}]+)(?:::(.+?))?}}\s*)?(?:{([^:}]+)(?:::(.+?))?}\s*)?(.+?)(?:\[(\d+)\])?$/;
  const match = preprocessed.match(pattern);

  if (match) {
    locLocationName = match[1] ? match[1].trim() : "";
    locLocationValue = match[2] ? match[2].trim() : "";
    locSectionName = match[3] ? match[3].trim() : "";
    locSectionValue = match[4] ? match[4].trim() : "";
    locFieldName = match[5]
      ? match[5]
          .trim()
          .replace(/\$1\$/g, "{{")
          .replace(/\$2\$/g, "{")
          .replace(/\$3\$/g, "[")
      : "";
    locFieldInstance = match[6] ? match[6].trim() : "1";
  } else {
    locFieldName = locField
      .trim()
      .replace(/\$1\$/g, "{{")
      .replace(/\$2\$/g, "{")
      .replace(/\$3\$/g, "[")
      .replace(/\$4\$/g, ",");
    locFieldInstance = "1";
  }
  
  // Set runtime variables for pattern template substitution
  vars.setValue("loc.auto.fieldName", locFieldName);
  vars.setValue("loc.auto.fieldName.toLowerCase", locFieldName.toLowerCase());
  vars.setValue("loc.auto.fieldInstance", locFieldInstance);
  vars.setValue("loc.auto.forId", locFieldForId);
  vars.setValue("loc.auto.location.value", locLocationValue);
  vars.setValue("loc.auto.section.value", locSectionValue);
  vars.setValue("loc.auto.location.name", locLocationName);
  vars.setValue("loc.auto.section.name", locSectionName);

  // Resolve location and section patterns from page object namespace
  locLocation = (locLocationName &&
    (vars.getValue(patternVarNameLocation + locLocationName) != patternVarNameLocation + locLocationName))
    ? vars.replaceVariables(vars.getValue(patternVarNameLocation + locLocationName))
    : "";
  locSection = (locSectionName &&
    (vars.getValue(patternVarNameSection + locSectionName) != patternVarNameSection + locSectionName))
    ? vars.replaceVariables(vars.getValue(patternVarNameSection + locSectionName))
    : "";

  console.log(` Parsed field components:`);
  console.log(`   - Field Name: ${locFieldName}`);
  console.log(`   - Instance: ${locFieldInstance}`);
  if (locLocationName) console.log(`   - Location: ${locLocationName} (${locLocation || 'not found'})`);
  if (locSectionName) console.log(`   - Section: ${locSectionName} (${locSection || 'not found'})`);

  // Load field patterns from page object namespace
  const patternKey = patternVarNameField + argType;
  if (vars.getValue(patternKey) == patternKey) {
    console.warn(` ✗ No valid locators found for type "${argType}" in active page object.`);
    console.warn(`   Pattern key attempted: ${patternKey}`);
    return [];
  }
  
  const patternsString = vars.replaceVariables(vars.getValue(patternKey));
  const patterns = patternsString.split(";");
  
  console.log(` Loaded ${patterns.length} fallback pattern(s) for type "${argType}" from page object`);
  
  return patterns;
}

/**
 * Checks locator type.
 */
async function checkLocatorType(locator: string): Promise<"xpath" | "css"> {
  const trimmed = locator.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("(")) {
    return "xpath";
  }
  return "css";
}

/**
 * Logging function.
 */
function log(message: string) {
  // logFixture.setLogger("Pattern Logging: " + message);
  // if (loggingStatus) console.log(`Pattern Logging: ${message}`);
}

/**
 * Scroll page helper.
 */
async function scrollPage(page: Page): Promise<void> {
  if (page.isClosed()) {
    console.warn("️ Cannot scroll: Page is already closed.");
    return;
  }
  const scrollList = (vars.getValue(patternVarNameSroll) != patternVarNameSroll)
    ? vars.replaceVariables(vars.getValue(patternVarNameSroll))
    : "";

  if (scrollList.trim() !== "") {
    const scrollSelectors = scrollList.split(";").map(e => e.trim());

    for (const scrollSelector of scrollSelectors) {
      const locator = page.locator(scrollSelector);
      const count = await locator.count();
      for (let i = 0; i < count; i++) {
        const item = locator.nth(i);
        if (await item.isVisible()) {
          console.log(` Scrolling to visible scroll element: ${scrollSelector} [${i}]`);
          await item.scrollIntoViewIfNeeded();
          for (let j = 0; j < 10; j++) {
            await page.mouse.wheel(0, 400);
            await page.waitForTimeout(500);
          }
        }
      }
    }
  } else {
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(500);
    }
  }
  return;
}

/**
 * Helper function that loops through locator candidates, scrolls between retries,
 * and returns a valid LocatorResult or null if none is found.
 * Uses only patterns from the active page object.
 * 
 * @param page - Playwright Page instance
 * @param timeout - Maximum time to retry
 * @param interval - Time between retries
 * @returns LocatorResult or null
 */
async function validateLocatorLoop(
  page: Page,
  timeout: number,
  interval: number,
): Promise<LocatorResult | null> {
  const startTime = Date.now();
  const labelLocators: string[] = await getLocatorEntries("label");
  let attemptCount = 0;

  while (Date.now() - startTime < timeout) {
    attemptCount++;
    console.log(` Attempt #${attemptCount} - Trying to resolve locator...`);
    
    // Only perform label resolution if the tag is eligible
    if (labelLocators.length > 0 && locFieldForId == "") {
      if (LABEL_ELIGIBLE_TAGS.has(locType)) {
        console.log(` Attempting label-based resolution for ${locType} element...`);
        for (let locator of labelLocators) {
          log(`>>>>> locFieldInstance: ${locFieldInstance}`);
          
          let locatorWithInstance =
            (await checkLocatorType(locator)) === "xpath" && locLocationName === "" &&
            locSectionName === "" &&
            !locator.startsWith("(")
              ? `(${locator})[${locFieldInstance}]`
              : locator;
          log(` Processing label locator: ${locatorWithInstance}`);
          const result = await evaluateChainedLocator(
            page,
            locLocation,
            locSection,
            locatorWithInstance,
            true
          );
          if (locFieldForId) {
            console.log(` ✓ Label found with for="${locFieldForId}"`);
          }
        }
      } else {
        console.debug(`⏭️ Skipping label check for tag: ${locType}`);
      }
    }

    const fieldLocators: string[] = await getLocatorEntries(locType);
    for (let i = 0; i < fieldLocators.length; i++) {
      const locator = fieldLocators[i];
      console.log(` Trying fallback pattern ${i + 1}/${fieldLocators.length}: ${locator.substring(0, 50)}${locator.length > 50 ? '...' : ''}`);
      
      let locatorWithInstance =
        (await checkLocatorType(locator)) === "xpath" && locLocationName === "" &&
        locSectionName === "" &&
        !locator.startsWith("(")
          ? `(${locator})[${locFieldInstance}]`
          : locator;

      log(` Processing Field locator: ${locatorWithInstance}`);

      try {
        const result = await evaluateChainedLocator(
          page,
          locLocation,
          locSection,
          locatorWithInstance,
          false
        );
        if (result && result.exists && result.visible) {
          console.log(` ✓ Valid locator found with pattern ${i + 1}: ${result.locator}`);
          return result;
        } else {
          console.log(` ✗ Pattern ${i + 1} did not find visible element`);
        }
      } catch (error) {
        console.warn(
          ` ✗ Error processing pattern ${i + 1}: ${locator.substring(0, 30)}... – ${
            (error as Error).message
          }`
        );
      }
    }
    
    // Scroll to reveal lazy-loaded elements.
    if (page.isClosed()) {
      console.warn("️ Cannot continue loop: Page is already closed.");
      return null;
    }
    
    console.log(` Scrolling page to reveal lazy-loaded content...`);
    await scrollPage(page);

    console.log(
      `⏳ Locator not found. Retrying in ${interval / 1000} seconds...`
    );
    await page.waitForTimeout(interval);
  }
  
  console.warn(` ✗ All ${attemptCount} attempts exhausted. No valid locator found.`);
  return null;
}

/**
 * Resets all global locator variables to their default state.
 * This function ensures clean context between each field processing.
 */
async function resetValues() {
  // Clear all global locator variables
  locField = "";
  locType = "";
  locFieldName = "";
  locFieldInstance = "";
  locFieldForId = "";

  locSection = "";
  locSectionName = "";
  locSectionValue = "";

  locLocation = "";
  locLocationName = "";
  locLocationValue = "";

  patternVarNameField = "";
  patternVarNameLocation = "";
  patternVarNameSection = "";
  patternVarNameSroll = "";

  // Clear all related variables in the global vars store
  const varsToReset = [
    "loc.auto.forId",
    "loc.auto.fieldName",
    "loc.auto.fieldName.toLowerCase",
    "loc.auto.fieldInstance",
    "loc.auto.location.value",
    "loc.auto.section.value",
    "loc.auto.location.name",
    "loc.auto.section.name"
  ];
  
  for (const varName of varsToReset) {
    vars.setValue(varName, "");
  }

  console.log(" All locator variables have been reset.");
}

/**
 * Main function that assigns globals, updates locator entries,
 * and calls the locator validation loop.
 * 
 * @param page - Playwright Page instance
 * @param argType - Element type (button, input, link, etc.)
 * @param argField - Field name with optional location/section/instance
 * @param argOverridePattern - Optional page object Pattern_Code override
 * @param argTimeout - Optional timeout override
 * @returns Playwright Locator object
 */
export async function patternIq(
  page: Page,
  argType: string,
  argField: string,
  argOverridePattern?: string,
  argTimeout?: number
): Promise<Locator> {
  if (!page) throw new Error("Page not initialized");
  await page.waitForLoadState("load");

  resetValues();
  locField = argField.trim();
  locType = argType.trim();
  let patternConfig: string;
  
  // Determine which page object pattern configuration to use
  if (argOverridePattern) {
    // Explicit page object override provided
    patternConfig = argOverridePattern.trim();
    console.log(` Using explicit page object pattern override: ${patternConfig}`);
  } else {
    // Use default page object from configuration
    patternConfig = (vars.getConfigValue("patternIq.config") === "config.patternIq.config")
      ? ""
      : vars.getConfigValue("patternIq.config");
    if (patternConfig === "") {
      throw new Error(` No pattern file name found. Please check your config or provide a pattern code override.`);
    }
    console.log(` Using default page object pattern from config: ${patternConfig}`);
  }

  // Set pattern variable names with page object namespace
  patternVarNameField = "pattern." + patternConfig.trim() + ".fields.";
  patternVarNameLocation = "pattern." + patternConfig.trim() + ".locations.";
  patternVarNameSection = "pattern." + patternConfig.trim() + ".sections.";
  patternVarNameSroll = "pattern." + patternConfig.trim() + ".scroll";

  console.log(` Pattern resolution context:`);
  console.log(`   - Page Object: ${patternConfig}`);
  console.log(`   - Element Type: ${argType}`);
  console.log(`   - Field Name: ${argField}`);

  const timeout = (argTimeout) ? argTimeout : (vars.getConfigValue('patternIq.retryTimeout') != 'config.patternIq.retryTimeout') ? Number(vars.getConfigValue('patternIq.retryTimeout')) : 30 * 1000;
  const interval =  (vars.getConfigValue('patternIq.retryInterval') != 'config.patternIq.retryInterval') ? Number(vars.getConfigValue('patternIq.retryInterval')) : 2000;
  
  const result = await validateLocatorLoop(page, timeout, interval);
  
  if (result && result.exists && result.visible) {
    console.log(` ✓ Successfully resolved locator for page object "${patternConfig}": ${result.locator}`);
    return page.locator(result.locator.toString());
  } else {
    console.warn(
      `️ ✗ Timeout reached! No valid locator found for page object "${patternConfig}", type "${argType}", field "${argField}".`
    );
    return page.locator("");
  }
}

