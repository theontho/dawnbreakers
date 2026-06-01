#pragma once

#include <filesystem>
#include <string>
#include <vector>

namespace skyrewind {

struct StarVertex {
  float ra = 0.0f;
  float dec = 0.0f;
  float pmRa = 0.0f;
  float pmDec = 0.0f;
  float magnitude = 0.0f;
  float colorR = 0.88f;
  float colorG = 0.93f;
  float colorB = 1.04f;
};

std::filesystem::path findCatalogPath(const char* overridePath);
std::vector<StarVertex> loadHipparcosCatalog(const std::filesystem::path& path);

} // namespace skyrewind
