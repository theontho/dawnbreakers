#pragma once

namespace skyrewind {

enum class ProjectionMode : int {
  Perspective = 0,
  AdaptiveFisheye = 1,
  CalibratedDisplay = 2,
};

struct PhysicalDisplaySettings {
  float surfaceWidthCentimeters = 60.0f;
  float surfaceHeightCentimeters = 40.0f;
  float eyeDistanceCentimeters = 25.0f;
};

struct ViewProjection {
  float verticalFovRadians = 1.0f;
  float horizontalFovRadians = 1.0f;
  float perspectiveAspect = 1.0f;
  float fisheyeBlend = 0.0f;
};

ViewProjection makeViewProjection(
  ProjectionMode mode,
  float cameraVerticalFovRadians,
  float viewportAspect,
  const PhysicalDisplaySettings& display
);

} // namespace skyrewind
