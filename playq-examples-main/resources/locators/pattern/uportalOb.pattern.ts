// import { test as base } from '@playwright/test';

// ****************** Only CSS and XPATH locators are supported ************************
 
/* 
loc.auto.fieldName
loc.auto.fieldName.toLowerCase
loc.auto.forId
loc.auto.fieldInstance
loc.auto.location.value
loc.auto.section.value
*/

export const uportalOb = {
  fields: {
    label: ["//label[text()='#{loc.auto.fieldName}']",
      "//label[contains(text(),'#{loc.auto.fieldName}')]",
      "//label[lower-case(text())='#{loc.auto.fieldName.toLowerCase}']",
      "//label[contains(lower-case(text()),'#{loc.auto.fieldName.toLowerCase}')]",
    ],
    dropdown: [
      // "//label[text()='#{loc.auto.fieldName}']//..//..//input[@value='placeholder']"
      "//label[text()='#{loc.auto.fieldName}']//..//div//div[@role='button']",
      "//label[text()='#{loc.auto.fieldName}']//..//div//input"
    ],
    dropdown_options: [ 
      "//ul[@role='listbox']/li[text()='#{loc.auto.fieldName}']"
       ],
    input: ["//input[@id='#{loc.auto.forId}']"
    ],
    link: [
      "//a[text()='#{loc.auto.fieldName}']", 
    ],
    radio: [
      "//div[@role='radiogroup']//span[text()='#{loc.auto.fieldName}']",
      "//label[@class='radio'][normalize-space(text())='#{loc.auto.fieldName}']/input"
    ],
    checkbox: [
      "//span[lower-case(text())='#{loc.auto.fieldName.toLowerCase}']/preceding::input[@type='checkbox']",
      "//span[contains(text(),'#{loc.auto.fieldName}')]/preceding::input[@type='checkbox']",
      "//Input[@type='checkbox']/preceding::label[normalize-space(text())='#{loc.auto.fieldName}']"
    ],
    button: [
      "//button[text()='#{loc.auto.fieldName}']", 
      "//button[translate(text(), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') = '#{loc.auto.fieldName}']",
    ],
    tab: [
      "//button[@role='tab'] [(text()='#{loc.auto.fieldName}')]",
      "//button[@role='tab'][translate(text(), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') = '#{loc.auto.fieldName}']"
    ],
    text: [
      "//p[normalize-space(text())='#{loc.auto.fieldName}']//following-sibling::p",
      "//p[normalize-space(text())='#{loc.auto.fieldName}']/following::p"
    ],
    header: [

    ],
  },
  locations: {
  },
  sections: {
    field: "//label[text()='#{loc.auto.section.value}']/parent::div",
    radio_group: "//fieldset[legend[normalize-space(text())='#{loc.auto.section.value}']]",
    accordion: "//button[contains(@class,'accordion')][text()='#{loc.auto.section.value}']",
  },
  scroll: [
     "h1:first-child",
      "//h2[1]",
      "//h3[1]",
  ]
};
