#include "MoonPath.hpp"

#include <algorithm>
#include <array>
#include <cmath>
#include <limits>
#include <vector>

namespace skyrewind {
namespace {

constexpr double kHoursPerYear = 24.0 * 365.2425;
constexpr double kFramingMarginRadians = 2.0 * kDegToRad;
constexpr double kPerspectiveLimitRadians = 110.0 * kDegToRad;

struct Vec3d {
  double x = 0.0;
  double y = 0.0;
  double z = 0.0;
};

Vec3d add(Vec3d a, Vec3d b) {
  return {a.x + b.x, a.y + b.y, a.z + b.z};
}

Vec3d scale(Vec3d value, double amount) {
  return {value.x * amount, value.y * amount, value.z * amount};
}

double dot(Vec3d a, Vec3d b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

Vec3d cross(Vec3d a, Vec3d b) {
  return {
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x,
  };
}

double length(Vec3d value) {
  return std::sqrt(std::max(0.0, dot(value, value)));
}

Vec3d normalize(Vec3d value) {
  const double magnitude = length(value);
  return magnitude > 1.0e-12
    ? scale(value, 1.0 / magnitude)
    : Vec3d{0.0, 1.0, 0.0};
}

double maximumAngularDistance(Vec3d center, const std::vector<Vec3d>& path) {
  double maximum = 0.0;
  for (const Vec3d point : path) {
    maximum = std::max(
      maximum,
      std::acos(clamp(dot(center, point), -1.0, 1.0))
    );
  }
  return maximum;
}

Vec3d refineCenter(Vec3d initial, const std::vector<Vec3d>& path) {
  Vec3d center = normalize(initial);
  for (int iteration = 0; iteration < 600; ++iteration) {
    const Vec3d* farthest = &path.front();
    double leastDot = dot(center, *farthest);
    for (const Vec3d& point : path) {
      const double pointDot = dot(center, point);
      if (pointDot < leastDot) {
        leastDot = pointDot;
        farthest = &point;
      }
    }

    const Vec3d tangent = add(*farthest, scale(center, -leastDot));
    const double step = 0.24 / std::sqrt(static_cast<double>(iteration) + 1.0);
    center = normalize(add(center, scale(tangent, step)));
  }
  return center;
}

Vec3d bestPathCenter(const std::vector<Vec3d>& path) {
  Vec3d average{};
  Vec3d pathNormal{};
  for (std::size_t index = 0; index < path.size(); ++index) {
    average = add(average, path[index]);
    if (index > 0) {
      pathNormal = add(pathNormal, cross(path[index - 1], path[index]));
    }
  }

  std::size_t farthestA = 0;
  std::size_t farthestB = 0;
  double farthestDot = 1.0;
  for (std::size_t a = 0; a < path.size(); ++a) {
    for (std::size_t b = a + 1; b < path.size(); ++b) {
      const double pairDot = dot(path[a], path[b]);
      if (pairDot < farthestDot) {
        farthestDot = pairDot;
        farthestA = a;
        farthestB = b;
      }
    }
  }

  const std::array<Vec3d, 5> candidates{
    average,
    pathNormal,
    scale(pathNormal, -1.0),
    add(path[farthestA], path[farthestB]),
    path[path.size() / 2],
  };
  Vec3d bestCenter = normalize(average);
  double bestRadius = std::numeric_limits<double>::infinity();
  for (Vec3d candidate : candidates) {
    if (length(candidate) <= 1.0e-12) {
      continue;
    }
    candidate = normalize(candidate);
    for (const Vec3d tested : {candidate, refineCenter(candidate, path)}) {
      const double radius = maximumAngularDistance(tested, path);
      if (radius < bestRadius) {
        bestRadius = radius;
        bestCenter = tested;
      }
    }
  }
  return bestCenter;
}

} // namespace

MoonPathFrame frameMoonPath(
  double startYear,
  double durationHours,
  const Location& location,
  float viewportAspect,
  float minimumFovRadians,
  float maximumFovRadians
) {
  constexpr int sampleCount = 241;
  std::vector<Vec3d> path;
  path.reserve(sampleCount);
  const double durationYears = durationHours / kHoursPerYear;
  for (int sample = 0; sample < sampleCount; ++sample) {
    const double t =
      static_cast<double>(sample) / static_cast<double>(sampleCount - 1);
    const SkyDirection direction =
      moonState(startYear + durationYears * t, location).direction;
    path.push_back(normalize({
      direction.east,
      direction.up,
      direction.north,
    }));
  }

  const Vec3d center = bestPathCenter(path);
  double halfFov = maximumAngularDistance(center, path) + kFramingMarginRadians;
  const double safeAspect = std::max(0.01, static_cast<double>(viewportAspect));
  const double narrowAxisScale = std::min(1.0, safeAspect);
  const double perspectiveHalfFov = halfFov < kHalfPi
    ? std::atan(std::tan(halfFov) / narrowAxisScale)
    : kPi;
  const bool useFisheye = perspectiveHalfFov * 2.0 > kPerspectiveLimitRadians;
  if (useFisheye) {
    halfFov /= narrowAxisScale;
  } else {
    halfFov = perspectiveHalfFov;
  }

  const float requestedFov = static_cast<float>(
    useFisheye
      ? std::max(135.0 * kDegToRad, halfFov * 2.0)
      : halfFov * 2.0
  );
  const float verticalFov = std::clamp(
    requestedFov,
    minimumFovRadians,
    maximumFovRadians
  );
  return {
    {
      static_cast<float>(center.x),
      static_cast<float>(center.y),
      static_cast<float>(center.z),
    },
    verticalFov,
    useFisheye,
    requestedFov > maximumFovRadians,
  };
}

} // namespace skyrewind
