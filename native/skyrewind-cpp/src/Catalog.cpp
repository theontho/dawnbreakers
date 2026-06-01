#include "Catalog.hpp"

#include "Astronomy.hpp"

#include <algorithm>
#include <cctype>
#include <fstream>
#include <sstream>
#include <stdexcept>

namespace skyrewind {
namespace {

std::string trim(std::string value) {
  const auto first = std::find_if_not(value.begin(), value.end(), [](unsigned char c) {
    return std::isspace(c);
  });
  const auto last = std::find_if_not(value.rbegin(), value.rend(), [](unsigned char c) {
    return std::isspace(c);
  }).base();

  if (first >= last) {
    return {};
  }
  return {first, last};
}

std::vector<std::string> splitCsvLine(const std::string& line) {
  std::vector<std::string> values;
  std::string current;
  bool quoted = false;

  for (std::size_t i = 0; i < line.size(); ++i) {
    const char c = line[i];
    if (c == '"') {
      if (quoted && i + 1 < line.size() && line[i + 1] == '"') {
        current.push_back('"');
        ++i;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (c == ',' && !quoted) {
      values.push_back(trim(current));
      current.clear();
      continue;
    }
    current.push_back(c);
  }

  values.push_back(trim(current));
  return values;
}

double parseDouble(const std::vector<std::string>& columns, std::size_t index, std::size_t rowNumber) {
  if (index >= columns.size()) {
    throw std::runtime_error("Missing column in Hipparcos row " + std::to_string(rowNumber));
  }

  try {
    return std::stod(columns[index]);
  } catch (const std::exception&) {
    throw std::runtime_error("Invalid numeric value in Hipparcos row " + std::to_string(rowNumber));
  }
}

float optionalColorIndex(const std::vector<std::string>& columns) {
  if (columns.size() < 9 || columns[8].empty()) {
    return 0.45f;
  }

  try {
    return static_cast<float>(std::stod(columns[8]));
  } catch (const std::exception&) {
    return 0.45f;
  }
}

StarVertex makeStar(const std::vector<std::string>& columns, std::size_t rowNumber) {
  const float colorIndex = optionalColorIndex(columns);
  const float colorT = static_cast<float>(clamp((colorIndex + 0.35f) / 2.35f, 0.0, 1.0));
  const float greenLift = std::sin(colorT * static_cast<float>(kPi)) * 0.16f;

  return {
    static_cast<float>(parseDouble(columns, 2, rowNumber) * kDegToRad),
    static_cast<float>(parseDouble(columns, 3, rowNumber) * kDegToRad),
    static_cast<float>(parseDouble(columns, 4, rowNumber) * kMasToRad),
    static_cast<float>(parseDouble(columns, 5, rowNumber) * kMasToRad),
    static_cast<float>(parseDouble(columns, 7, rowNumber)),
    0.72f + colorT * 0.48f,
    0.82f + greenLift,
    1.16f - colorT * 0.58f,
  };
}

} // namespace

std::filesystem::path findCatalogPath(const char* overridePath) {
  if (overridePath != nullptr && std::string(overridePath).size() > 0) {
    return std::filesystem::path(overridePath);
  }

  std::filesystem::path current = std::filesystem::current_path();
  for (int depth = 0; depth < 8; ++depth) {
    const auto candidate = current / "public" / "sky" / "hipparcos.csv";
    if (std::filesystem::exists(candidate)) {
      return candidate;
    }
    if (!current.has_parent_path() || current == current.parent_path()) {
      break;
    }
    current = current.parent_path();
  }

  return std::filesystem::path("public") / "sky" / "hipparcos.csv";
}

std::vector<StarVertex> loadHipparcosCatalog(const std::filesystem::path& path) {
  std::ifstream input(path);
  if (!input) {
    throw std::runtime_error("Unable to open Hipparcos catalog: " + path.string());
  }

  std::vector<StarVertex> stars;
  stars.reserve(120000);

  std::string line;
  std::size_t rowNumber = 0;
  bool headerSeen = false;
  while (std::getline(input, line)) {
    ++rowNumber;
    const std::string clean = trim(line);
    if (clean.empty() || clean.starts_with('#')) {
      continue;
    }
    if (!headerSeen) {
      headerSeen = true;
      continue;
    }

    stars.push_back(makeStar(splitCsvLine(clean), rowNumber));
  }

  if (stars.empty()) {
    throw std::runtime_error("Hipparcos catalog contained no stars: " + path.string());
  }

  return stars;
}

} // namespace skyrewind
