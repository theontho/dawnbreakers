#pragma once

#include "Astronomy.hpp"

#include <array>

namespace skyrewind {

enum class SolarSystemBody {
  Sun,
  Mercury,
  Venus,
  Mars,
  Jupiter,
  Saturn,
};

struct SolarSystemBodyState {
  SolarSystemBody body = SolarSystemBody::Sun;
  SkyDirection direction;
  float apparentMagnitude = 0.0f;
  float angularDiameterRadians = 0.0f;
  std::array<float, 3> color{1.0f, 1.0f, 1.0f};
};

std::array<SolarSystemBodyState, 6> solarSystemState(
  double decimalYear,
  const Location& location
);

} // namespace skyrewind
