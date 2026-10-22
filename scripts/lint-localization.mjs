import { analyzeLocalization, sortedMissing, sortedMissingBy } from './lib/localization.mjs';

const {
  localizedLocales,
  nameCatalogs,
  duplicates,
  translationRequired,
  namesRequired,
  unwrappedTextErrors,
  hasLocaleCoverage,
} = analyzeLocalization();

const missingByLocale = localizedLocales.map(locale => ({
  locale,
  missingTranslations: sortedMissingBy(translationRequired, key => hasLocaleCoverage(locale, key)),
  missingNames: sortedMissing(namesRequired, nameCatalogs.get(locale) ?? new Set()),
}));
const errors = [];

if (duplicates.length > 0) {
  errors.push(`Duplicate localization keys:\n${duplicates.map(key => `  - ${key}`).join('\n')}`);
}
for (const { locale, missingTranslations, missingNames } of missingByLocale) {
  if (missingTranslations.length > 0) {
    errors.push(`Missing ${locale} translations:\n${missingTranslations.map(([key, refs]) => `  - ${key}\n    ${refs.join('\n    ')}`).join('\n')}`);
  }
  if (missingNames.length > 0) {
    errors.push(`Missing ${locale} localized names:\n${missingNames.map(([key, refs]) => `  - ${key}\n    ${refs.join('\n    ')}`).join('\n')}`);
  }
}
if (unwrappedTextErrors.length > 0) {
  errors.push(`Unwrapped visible text:\n${unwrappedTextErrors.map(error => `  - ${error}`).join('\n')}`);
}

if (errors.length > 0) {
  console.error(errors.join('\n\n'));
  process.exit(1);
}

console.log(`Localization lint passed: ${translationRequired.size} text keys and ${namesRequired.size} names checked for ${localizedLocales.join(', ')}.`);
