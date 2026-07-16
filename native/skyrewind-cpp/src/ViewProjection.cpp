#include "ViewProjection.hpp"

#include <algorithm>
#include <cmath>

namespace skyrewind {
namespace {

constexpr float kPi = 3.14159265358979323846f;
constexpr float kDegToRad = kPi / 180.0f;

float clampFov(float radians) {
  return std::clamp(radians, 0.1f * kDegToRad, 179.0f * kDegToRad);
}

float smoothStep(float value) {
  const float t = std::clamp(value, 0.0f, 1.0f);
  return t * t * (3.0f - 2.0f * t);
}

float angularSize(float physicalSize, float eyeDistance) {
  return 2.0f * std::atan(
    std::max(0.01f, physicalSize) /
    (2.0f * std::max(0.01f, eyeDistance))
  );
}

} // namespace

ViewProjection makeViewProjection(
  ProjectionMode mode,
  float cameraVerticalFovRadians,
  float viewportAspect,
  const PhysicalDisplaySettings& display
) {
  const float safeViewportAspect = std::max(0.01f, viewportAspect);
  if (mode == ProjectionMode::CalibratedDisplay) {
    const float verticalFov = clampFov(angularSize(
      display.surfaceHeightCentimeters,
      display.eyeDistanceCentimeters
    ));
    const float horizontalFov = clampFov(angularSize(
      display.surfaceWidthCentimeters,
      display.eyeDistanceCentimeters
    ));
    return {
      verticalFov,
      horizontalFov,
      std::tan(horizontalFov * 0.5f) / std::tan(verticalFov * 0.5f),
      0.0f,
    };
  }

  const float verticalFov = clampFov(cameraVerticalFovRadians);
  const float horizontalFov = 2.0f * std::atan(
    std::tan(verticalFov * 0.5f) * safeViewportAspect
  );
  const float fovDegrees = verticalFov / kDegToRad;
  return {
    verticalFov,
    horizontalFov,
    safeViewportAspect,
    mode == ProjectionMode::AdaptiveFisheye
      ? smoothStep((fovDegrees - 110.0f) / 25.0f)
      : 0.0f,
  };
}

} // namespace skyrewind
