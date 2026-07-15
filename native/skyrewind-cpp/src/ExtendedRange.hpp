#pragma once

struct GLFWwindow;

namespace skyrewind {

struct ExtendedRangeState {
  bool floatingPointSurface = false;
  bool displayCapable = false;
  float currentHeadroom = 1.0f;
  float potentialHeadroom = 1.0f;
};

ExtendedRangeState configureExtendedRange(GLFWwindow* window);
ExtendedRangeState queryExtendedRange(GLFWwindow* window, bool floatingPointSurface);

} // namespace skyrewind
