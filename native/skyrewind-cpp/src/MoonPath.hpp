#pragma once

#include "Astronomy.hpp"

namespace skyrewind {

struct MoonPathFrame {
  SkyDirection center;
  float verticalFovRadians = 1.0f;
  bool useFisheye = false;
  bool clipped = false;
};

MoonPathFrame frameMoonPath(
  double startYear,
  double durationHours,
  const Location& location,
  float viewportAspect,
  float minimumFovRadians,
  float maximumFovRadians
);

} // namespace skyrewind
