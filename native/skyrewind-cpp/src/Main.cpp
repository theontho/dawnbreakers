#include "Astronomy.hpp"
#include "Catalog.hpp"
#include "ExtendedRange.hpp"
#include "LongExposure.hpp"
#include "MoonPath.hpp"
#include "SolarSystem.hpp"
#include "StarTrails.hpp"
#include "TimePlayer.hpp"
#include "ViewProjection.hpp"
#ifdef __APPLE__
#include "MacDockIcon.hpp"
#endif

#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <cstddef>
#include <cstdint>
#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

#define GLFW_INCLUDE_NONE
#include <GLFW/glfw3.h>
#ifdef __APPLE__
#include <OpenGL/gl3.h>
#else
#include <GL/gl.h>
#endif

#include <imgui.h>
#include <imgui_impl_glfw.h>
#include <imgui_impl_opengl3.h>

namespace skyrewind {
namespace {

constexpr float kSkyRadius = 140.0f;
constexpr double kInitialYear = 2022.28;
constexpr double kDefaultRewindYears = 2022.0;
constexpr double kDefaultDurationSeconds = 14.0;
constexpr double kDefaultLatitudeDegrees = 30.0444;
constexpr double kDefaultLongitudeDegrees = 31.2357;
constexpr double kSiderealRadiansPerYear = 360.98564736629 * 365.2425 * kDegToRad;
constexpr int kMaxExposureSamples = 12;
constexpr float kMinimumFovDegrees = 34.0f;
constexpr float kMaximumFovDegrees = 175.0f;

struct Vec3 {
  float x = 0.0f;
  float y = 0.0f;
  float z = 0.0f;
};

struct Vec2 {
  float x = 0.0f;
  float y = 0.0f;
};

struct Mat4 {
  std::array<float, 16> m{};
};

struct AnimationState {
  double startYear = kInitialYear;
  double currentYear = kInitialYear;
  double targetYear = kInitialYear - kDefaultRewindYears;
  double durationSeconds = kDefaultDurationSeconds;
  double startedAt = 0.0;
  double pausedAt = 0.0;
  double pausedDuration = 0.0;
  double speed = 0.0;
  double motionStrength = 0.0;
  bool active = false;
  bool paused = false;
  TimeCurve curve{};
};

struct CameraState {
  float yaw = 0.0f;
  float pitch = 0.35f;
  float fovRadians = 62.0f * static_cast<float>(kDegToRad);
  bool dragging = false;
  double pointerX = 0.0;
  double pointerY = 0.0;
};

enum class MoonTrackingMode : int {
  Off = 0,
  HorizonUp = 1,
  SkyStabilized = 2,
};

enum class StreakStyle : int {
  SmoothExposure = 0,
  SolidLightTrail = 1,
  ShutterSamples = 2,
  LegacyFullStarLines = 3,
};

struct GuiState {
  float startYear = static_cast<float>(kInitialYear);
  float rewindYears = static_cast<float>(kDefaultRewindYears);
  float durationSeconds = static_cast<float>(kDefaultDurationSeconds);
  float inertiaPortion = 0.32f;
  float driftPercent = 0.0004f;
  float power = 3.0f;
  float latitudeDegrees = static_cast<float>(kDefaultLatitudeDegrees);
  float longitudeDegrees = static_cast<float>(kDefaultLongitudeDegrees);
  float faintMagnitudeLimit = 12.5f;
  float brightMagnitudeLimit = 5.6f;
  float starSizeScale = 1.0f;
  float horizonAlpha = 0.82f;
  float shutterDurationSeconds = 0.65f;
  float exposureMotionThresholdPixels = 0.7f;
  float exposureStrength = 0.92f;
  float exposureSampleSpacingPixels = 64.0f;
  float legacyStreakLengthYears = 0.42f;
  float legacyStreakWidthPixels = 3.5f;
  float zoetropeIntervalYears = 650.0f;
  float zoetropeBlendPortion = 0.18f;
  float layerSeparation = 0.42f;
  float atmosphereWarp = 0.26f;
  float moonSizePixels = 82.0f;
  float moonPathHours = 24.0f;
  float solarSystemSizeScale = 1.0f;
  float hdrExposure = 0.0f;
  PhysicalDisplaySettings physicalDisplay;
  bool zoetropeSampling = true;
  bool layeredSky = true;
  bool showMoon = true;
  bool showSun = true;
  bool showPlanets = true;
  bool moonPathFrameClipped = false;
  MoonTrackingMode moonTrackingMode = MoonTrackingMode::Off;
  ProjectionMode projectionMode = ProjectionMode::AdaptiveFisheye;
  StreakStyle streakStyle = StreakStyle::SmoothExposure;
  bool hdrOutput = true;
  bool longExposure = true;
  bool showHorizon = true;
  bool vsync = true;
  bool showControls = true;
};

enum class VisibleProgram {
  CinematicRewind,
  TimePlayer,
};

struct AppState {
  CameraState camera;
  AnimationState animation;
  TimePlayerState timePlayer;
  GuiState gui;
  Location location;
  ExtendedRangeState extendedRange;
  VisibleProgram visibleProgram = VisibleProgram::TimePlayer;
  int framebufferWidth = 1440;
  int framebufferHeight = 960;
  float exposureMotionPixels = 0.0f;
  int exposureSampleCount = 1;
  std::size_t exposureTrailStarCount = 0;
  bool exposureActive = false;
};

struct GlProgram {
  GLuint id = 0;
};

struct GuideVertex {
  float x = 0.0f;
  float y = 0.0f;
  float z = 0.0f;
  float r = 1.0f;
  float g = 1.0f;
  float b = 1.0f;
  float a = 1.0f;
};

struct ZoetropeState {
  double primaryYear = kInitialYear;
  double secondaryYear = kInitialYear;
  float secondaryAlpha = 0.0f;
  float lockPulse = 0.0f;
};

std::vector<std::uint8_t> makeMoonIconPixels(int size) {
  std::vector<std::uint8_t> pixels(static_cast<std::size_t>(size * size * 4), 0);
  const float center = (static_cast<float>(size) - 1.0f) * 0.5f;
  const float badgeRadius = static_cast<float>(size) * 0.46f;
  const float moonRadius = static_cast<float>(size) * 0.29f;
  const float moonCenterX = center + static_cast<float>(size) * 0.04f;
  const float cutoutOffset = static_cast<float>(size) * 0.16f;

  for (int y = 0; y < size; ++y) {
    for (int x = 0; x < size; ++x) {
      const float fx = static_cast<float>(x) - center;
      const float fy = static_cast<float>(y) - center;
      const float badgeDistance = std::sqrt(fx * fx + fy * fy);
      const float badgeAlpha = std::clamp((badgeRadius - badgeDistance) / 1.5f, 0.0f, 1.0f);
      const float moonX = static_cast<float>(x) - moonCenterX;
      const float moonDistance = std::sqrt(moonX * moonX + fy * fy);
      const float cutoutDistance = std::sqrt((moonX + cutoutOffset) * (moonX + cutoutOffset) + fy * fy);
      const float moonAlpha = std::clamp((moonRadius - moonDistance) / 1.4f, 0.0f, 1.0f);
      const float cutoutAlpha = std::clamp((moonRadius * 0.96f - cutoutDistance) / 1.6f, 0.0f, 1.0f);
      const float crescent = std::clamp(moonAlpha * (1.0f - cutoutAlpha), 0.0f, 1.0f);
      const float border = std::clamp((badgeRadius - badgeDistance) / 1.0f, 0.0f, 1.0f) *
        std::clamp((badgeDistance - badgeRadius + 3.0f) / 1.0f, 0.0f, 1.0f);
      const float red = 10.0f * (1.0f - crescent) + 230.0f * crescent + 58.0f * border;
      const float green = 17.0f * (1.0f - crescent) + 242.0f * crescent + 132.0f * border;
      const float blue = 32.0f * (1.0f - crescent) + 255.0f * crescent + 180.0f * border;
      const std::size_t offset = static_cast<std::size_t>((y * size + x) * 4);
      pixels[offset] = static_cast<std::uint8_t>(std::clamp(red, 0.0f, 255.0f));
      pixels[offset + 1] = static_cast<std::uint8_t>(std::clamp(green, 0.0f, 255.0f));
      pixels[offset + 2] = static_cast<std::uint8_t>(std::clamp(blue, 0.0f, 255.0f));
      pixels[offset + 3] = static_cast<std::uint8_t>(badgeAlpha * 255.0f);
    }
  }

  return pixels;
}

void setMoonWindowIcon(GLFWwindow* window) {
  constexpr int iconSize = 64;
  std::vector<std::uint8_t> pixels = makeMoonIconPixels(iconSize);
  GLFWimage icon{
    iconSize,
    iconSize,
    pixels.data(),
  };
  glfwSetWindowIcon(window, 1, &icon);
#ifdef __APPLE__
  setMacDockIcon(pixels.data(), iconSize, iconSize);
#endif
}

float clampFloat(float value, float minValue, float maxValue) {
  return std::max(minValue, std::min(maxValue, value));
}

float wrappedAngleDistance(float a, float b) {
  const float delta = a - b;
  return std::abs(std::atan2(std::sin(delta), std::cos(delta)));
}

float estimateApparentMotionPixels(
  const ProjectionUniforms& current,
  const ProjectionUniforms& previous,
  double currentYear,
  double previousYear,
  float fovRadians,
  int viewportHeight,
  float fisheyeBlend
) {
  const float siderealMotion = static_cast<float>(std::min(
    std::abs(currentYear - previousYear) * kSiderealRadiansPerYear,
    kTau
  ));
  const float currentTheta = std::atan2(current.sinTheta, current.cosTheta);
  const float previousTheta = std::atan2(previous.sinTheta, previous.cosTheta);
  const float precessionMotion = std::max({
    wrappedAngleDistance(current.z, previous.z),
    wrappedAngleDistance(current.zeta, previous.zeta),
    wrappedAngleDistance(currentTheta, previousTheta),
  });
  const float perspectiveFocalLength =
    static_cast<float>(std::max(1, viewportHeight)) /
    (2.0f * std::tan(std::max(0.01f, fovRadians) * 0.5f));
  const float fisheyeFocalLength =
    static_cast<float>(std::max(1, viewportHeight)) / std::max(0.01f, fovRadians);
  const float focalLengthPixels =
    perspectiveFocalLength +
    (fisheyeFocalLength - perspectiveFocalLength) * fisheyeBlend;
  return (siderealMotion + precessionMotion) * focalLengthPixels;
}

double smoothStep01(double value) {
  const double t = clamp(value, 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

Vec3 normalize(Vec3 value) {
  const float length = std::sqrt(value.x * value.x + value.y * value.y + value.z * value.z);
  if (length <= 0.0f) {
    return {};
  }
  return {value.x / length, value.y / length, value.z / length};
}

Vec3 cross(Vec3 a, Vec3 b) {
  return {
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x,
  };
}

float dot(Vec3 a, Vec3 b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

Vec2 projectSkyDirection(
  Vec3 viewDirection,
  float fovRadians,
  float aspect,
  float fisheyeBlend
) {
  const Vec3 direction = normalize(viewDirection);
  const float safeDepth = std::max(0.0001f, -direction.z);
  const float focalScale = 1.0f / std::tan(std::max(0.01f, fovRadians) * 0.5f);
  const Vec2 perspectiveNdc{
    direction.x * focalScale / (safeDepth * aspect),
    direction.y * focalScale / safeDepth,
  };

  const float radialLength = std::hypot(direction.x, direction.y);
  const float theta = std::acos(clampFloat(-direction.z, -1.0f, 1.0f));
  const float fisheyeRadius = theta / std::max(0.01f, fovRadians * 0.5f);
  const Vec2 fisheyeNdc = radialLength > 0.00001f
    ? Vec2{
        direction.x / radialLength * fisheyeRadius / aspect,
        direction.y / radialLength * fisheyeRadius,
      }
    : Vec2{};

  return {
    perspectiveNdc.x + (fisheyeNdc.x - perspectiveNdc.x) * fisheyeBlend,
    perspectiveNdc.y + (fisheyeNdc.y - perspectiveNdc.y) * fisheyeBlend,
  };
}

Mat4 multiply(const Mat4& a, const Mat4& b) {
  Mat4 out;
  for (int column = 0; column < 4; ++column) {
    for (int row = 0; row < 4; ++row) {
      out.m[column * 4 + row] =
        a.m[0 * 4 + row] * b.m[column * 4 + 0] +
        a.m[1 * 4 + row] * b.m[column * 4 + 1] +
        a.m[2 * 4 + row] * b.m[column * 4 + 2] +
        a.m[3 * 4 + row] * b.m[column * 4 + 3];
    }
  }
  return out;
}

Vec3 transformDirection(const Mat4& matrix, Vec3 value) {
  return {
    matrix.m[0] * value.x + matrix.m[4] * value.y + matrix.m[8] * value.z,
    matrix.m[1] * value.x + matrix.m[5] * value.y + matrix.m[9] * value.z,
    matrix.m[2] * value.x + matrix.m[6] * value.y + matrix.m[10] * value.z,
  };
}

Mat4 perspective(float fovRadians, float aspect, float nearPlane, float farPlane) {
  const float f = 1.0f / std::tan(fovRadians * 0.5f);
  Mat4 out;
  out.m[0] = f / aspect;
  out.m[5] = f;
  out.m[10] = (farPlane + nearPlane) / (nearPlane - farPlane);
  out.m[11] = -1.0f;
  out.m[14] = (2.0f * farPlane * nearPlane) / (nearPlane - farPlane);
  return out;
}

Mat4 lookAt(Vec3 eye, Vec3 target, Vec3 up) {
  const Vec3 forward = normalize({target.x - eye.x, target.y - eye.y, target.z - eye.z});
  Vec3 side = cross(forward, up);
  if (dot(side, side) < 0.000001f) {
    const Vec3 fallbackUp = std::abs(forward.y) > 0.95f
      ? Vec3{0.0f, 0.0f, -1.0f}
      : Vec3{0.0f, 1.0f, 0.0f};
    side = cross(forward, fallbackUp);
  }
  side = normalize(side);
  const Vec3 cameraUp = cross(side, forward);

  Mat4 out;
  out.m[0] = side.x;
  out.m[4] = side.y;
  out.m[8] = side.z;
  out.m[1] = cameraUp.x;
  out.m[5] = cameraUp.y;
  out.m[9] = cameraUp.z;
  out.m[2] = -forward.x;
  out.m[6] = -forward.y;
  out.m[10] = -forward.z;
  out.m[12] = -dot(side, eye);
  out.m[13] = -dot(cameraUp, eye);
  out.m[14] = dot(forward, eye);
  out.m[15] = 1.0f;
  return out;
}

GLuint compileShader(GLenum type, const char* source) {
  const GLuint shader = glCreateShader(type);
  glShaderSource(shader, 1, &source, nullptr);
  glCompileShader(shader);

  GLint ok = 0;
  glGetShaderiv(shader, GL_COMPILE_STATUS, &ok);
  if (!ok) {
    GLint logLength = 0;
    glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &logLength);
    std::string log(static_cast<std::size_t>(logLength), '\0');
    glGetShaderInfoLog(shader, logLength, nullptr, log.data());
    glDeleteShader(shader);
    throw std::runtime_error("OpenGL shader compile failed: " + log);
  }
  return shader;
}

GlProgram makeProgram(const char* vertexSource, const char* fragmentSource, const char* geometrySource = nullptr) {
  const GLuint vertex = compileShader(GL_VERTEX_SHADER, vertexSource);
  const GLuint fragment = compileShader(GL_FRAGMENT_SHADER, fragmentSource);
  const GLuint geometry = geometrySource == nullptr ? 0 : compileShader(GL_GEOMETRY_SHADER, geometrySource);
  const GLuint program = glCreateProgram();
  glAttachShader(program, vertex);
  if (geometry != 0) {
    glAttachShader(program, geometry);
  }
  glAttachShader(program, fragment);
  glLinkProgram(program);
  glDeleteShader(vertex);
  if (geometry != 0) {
    glDeleteShader(geometry);
  }
  glDeleteShader(fragment);

  GLint ok = 0;
  glGetProgramiv(program, GL_LINK_STATUS, &ok);
  if (!ok) {
    GLint logLength = 0;
    glGetProgramiv(program, GL_INFO_LOG_LENGTH, &logLength);
    std::string log(static_cast<std::size_t>(logLength), '\0');
    glGetProgramInfoLog(program, logLength, nullptr, log.data());
    glDeleteProgram(program);
    throw std::runtime_error("OpenGL program link failed: " + log);
  }

  return {program};
}

const char* starVertexShader() {
  return R"GLSL(
    #version 410 core

    layout(location = 0) in float aRa;
    layout(location = 1) in float aDec;
    layout(location = 2) in float aPmRa;
    layout(location = 3) in float aPmDec;
    layout(location = 4) in float aMagnitude;
    layout(location = 5) in vec3 aColor;

    uniform mat4 uView;
    uniform mat4 uProjection;
    uniform float uYearsSinceCatalog;
    uniform float uZeta;
    uniform float uZ;
    uniform float uCosTheta;
    uniform float uSinTheta;
    uniform float uLocalSiderealTime;
    uniform float uSinLat;
    uniform float uCosLat;
    uniform float uSkyRadius;
    uniform float uMaxVisibleMagnitude;
    uniform float uCinematicStrength;
    uniform float uHdrHighlightScale;
    uniform float uStarSizeScale;
    uniform float uLayerAlpha;
    uniform float uLayerBlueShift;
    uniform float uAtmosphereWarp;
    uniform float uEffectClock;
    uniform float uFovRadians;
    uniform float uAspect;
    uniform float uFisheyeBlend;

    out vec3 vColor;
    out float vAlpha;

    void main() {
      float visible = step(aMagnitude, uMaxVisibleMagnitude);
      float currentDec = clamp(aDec + aPmDec * uYearsSinceCatalog, -1.57079637, 1.57079637);
      float cosDec = cos(currentDec);
      float sinDec = sin(currentDec);
      float raZeta = aRa + aPmRa * uYearsSinceCatalog + uZeta;
      float a = cosDec * sin(raZeta);
      float b = uCosTheta * cosDec * cos(raZeta) - uSinTheta * sinDec;
      float c = clamp(uSinTheta * cosDec * cos(raZeta) + uCosTheta * sinDec, -1.0, 1.0);
      float precessedRa = atan(a, b) + uZ;
      float precessedCosDec = sqrt(max(0.0, 1.0 - c * c));
      float hourAngle = uLocalSiderealTime - precessedRa;
      float x = -precessedCosDec * sin(hourAngle) * uSkyRadius;
      float y = (c * uSinLat + precessedCosDec * uCosLat * cos(hourAngle)) * uSkyRadius;
      float north = c * uCosLat - precessedCosDec * uSinLat * cos(hourAngle);
      float zPosition = -north * uSkyRadius;
      float warp = uAtmosphereWarp * uCinematicStrength;
      float shimmer = sin((x + zPosition) * 0.021 + uEffectClock * 0.73) +
        cos((y - zPosition) * 0.017 - uEffectClock * 0.51);
      x += shimmer * warp * 1.2;
      y += sin(x * 0.015 + uEffectClock * 0.39) * warp * 0.62;

      float brightness = clamp(1.0 - (aMagnitude + 1.4) / 10.4, 0.035, 1.0);
      float thresholdFade = clamp((uMaxVisibleMagnitude - aMagnitude) / 0.8, 0.1, 1.0);
      float lowerSkyDimming = y < 0.0 ? clamp(1.0 + (y / uSkyRadius) * 0.82, 0.18, 1.0) : 1.0;
      float baseIntensity = clamp(
        (pow(brightness, 1.45) + uCinematicStrength * 0.09) *
          lowerSkyDimming * thresholdFade,
        0.018,
        1.0
      );
      float intensity = baseIntensity + pow(brightness, 4.0) * uHdrHighlightScale;
      float maxRadiance = 1.0 + uHdrHighlightScale;

      vColor = vec3(
        clamp(intensity * aColor.r, 0.0, maxRadiance),
        clamp(intensity * aColor.g, 0.0, maxRadiance),
        clamp(
          intensity * (aColor.b + uCinematicStrength * (0.16 + uLayerBlueShift)),
          0.0,
          maxRadiance
        )
      );
      vec4 viewPosition = uView * vec4(x, y, zPosition, 1.0);
      vec3 viewDirection = normalize(viewPosition.xyz);
      float angularDistance = acos(clamp(-viewDirection.z, -1.0, 1.0));
      float halfFov = uFovRadians * 0.5;
      float perspectiveCorner = atan(tan(halfFov) * sqrt(1.0 + uAspect * uAspect));
      float angularLimit = mix(perspectiveCorner, halfFov, uFisheyeBlend);
      visible *= step(angularDistance, angularLimit);
      vAlpha = visible * uLayerAlpha;

      vec4 perspectivePosition = uProjection * viewPosition;
      vec2 perspectiveNdc =
        perspectivePosition.xy / max(0.0001, abs(perspectivePosition.w));
      float radialLength = length(viewDirection.xy);
      float fisheyeRadius = angularDistance / max(0.01, uFovRadians * 0.5);
      vec2 fisheyeNdc = radialLength > 0.00001
        ? vec2(
            viewDirection.x / radialLength * fisheyeRadius / uAspect,
            viewDirection.y / radialLength * fisheyeRadius
          )
        : vec2(0.0);
      vec2 projectedNdc = mix(perspectiveNdc, fisheyeNdc, uFisheyeBlend);

      float starSize = (2.4 + sqrt(brightness) * 7.8 + uCinematicStrength * 5.5) * uStarSizeScale;
      float perspectiveSizeScale =
        tan(radians(31.0)) / tan(max(0.01, uFovRadians * 0.5));
      float fisheyeSizeScale = radians(62.0) / max(0.01, uFovRadians);
      float angularSizeScale = clamp(
        mix(perspectiveSizeScale, fisheyeSizeScale, uFisheyeBlend),
        0.35,
        2.5
      );
      gl_PointSize = visible * starSize * angularSizeScale;
      gl_Position = uFisheyeBlend > 0.0
        ? vec4(projectedNdc, 0.0, 1.0)
        : perspectivePosition;
    }
  )GLSL";
}

const char* starFragmentShader() {
  return R"GLSL(
    #version 410 core

    in vec3 vColor;
    in float vAlpha;
    out vec4 fragColor;

    void main() {
      if (vAlpha <= 0.0) {
        discard;
      }

      float dist = distance(gl_PointCoord, vec2(0.5));
      if (dist > 0.5) {
        discard;
      }
      float alpha = 1.0 - smoothstep(0.08, 0.5, dist);
      fragColor = vec4(vColor, alpha * vAlpha);
    }
  )GLSL";
}

const char* skyBodyVertexShader() {
  return R"GLSL(
    #version 410 core

    uniform mat4 uView;
    uniform mat4 uProjection;
    uniform vec3 uBodyPosition;
    uniform float uFovRadians;
    uniform float uAspect;
    uniform float uFisheyeBlend;

    out float vVisible;

    void main() {
      vec4 viewPosition = uView * vec4(uBodyPosition, 1.0);
      vec3 viewDirection = normalize(viewPosition.xyz);
      float angularDistance = acos(clamp(-viewDirection.z, -1.0, 1.0));
      float halfFov = uFovRadians * 0.5;
      float perspectiveCorner = atan(tan(halfFov) * sqrt(1.0 + uAspect * uAspect));
      float angularLimit = mix(perspectiveCorner, halfFov, uFisheyeBlend);
      vVisible = step(angularDistance, angularLimit);

      vec4 perspectivePosition = uProjection * viewPosition;
      vec2 perspectiveNdc =
        perspectivePosition.xy / max(0.0001, abs(perspectivePosition.w));
      float radialLength = length(viewDirection.xy);
      float fisheyeRadius = angularDistance / max(0.01, uFovRadians * 0.5);
      vec2 fisheyeNdc = radialLength > 0.00001
        ? vec2(
            viewDirection.x / radialLength * fisheyeRadius / uAspect,
            viewDirection.y / radialLength * fisheyeRadius
          )
        : vec2(0.0);
      vec2 projectedNdc = mix(perspectiveNdc, fisheyeNdc, uFisheyeBlend);
      gl_Position = uFisheyeBlend > 0.0
        ? vec4(projectedNdc, 0.0, 1.0)
        : perspectivePosition;
    }
  )GLSL";
}

const char* skyBodyGeometryShader() {
  return R"GLSL(
    #version 410 core

    layout(points) in;
    layout(triangle_strip, max_vertices = 4) out;

    uniform vec2 uViewport;
    uniform float uSizePixels;

    in float vVisible[];
    out vec2 gUv;

    void emitBodyVertex(vec4 center, vec2 offset, vec2 uv) {
      gUv = uv;
      gl_Position = vec4(center.xy + offset * center.w, center.zw);
      EmitVertex();
    }

    void main() {
      vec4 center = gl_in[0].gl_Position;
      if (center.w <= 0.0 || vVisible[0] <= 0.0) {
        return;
      }

      vec2 halfSizeNdc = vec2(uSizePixels) / uViewport;
      emitBodyVertex(center, vec2(-halfSizeNdc.x, -halfSizeNdc.y), vec2(-1.0, -1.0));
      emitBodyVertex(center, vec2(halfSizeNdc.x, -halfSizeNdc.y), vec2(1.0, -1.0));
      emitBodyVertex(center, vec2(-halfSizeNdc.x, halfSizeNdc.y), vec2(-1.0, 1.0));
      emitBodyVertex(center, vec2(halfSizeNdc.x, halfSizeNdc.y), vec2(1.0, 1.0));
      EndPrimitive();
    }
  )GLSL";
}

const char* moonFragmentShader() {
  return R"GLSL(
    #version 410 core

    uniform float uAlpha;
    uniform vec3 uLightDirection;

    in vec2 gUv;
    out vec4 fragColor;

    void main() {
      float radius = length(gUv);
      if (radius > 1.0) {
        discard;
      }

      float surfaceZ = sqrt(max(0.0, 1.0 - dot(gUv, gUv)));
      vec3 surfaceNormal = vec3(gUv, surfaceZ);
      float light = dot(surfaceNormal, normalize(uLightDirection));
      float litMask = smoothstep(-0.018, 0.018, light);
      float limb = 0.42 + 0.58 * sqrt(max(0.0, surfaceZ));
      float lightFalloff = 0.5 + 0.5 * sqrt(max(0.0, light));
      vec3 darkSide = vec3(0.0015, 0.003, 0.008);
      vec3 litSide = vec3(0.86, 0.93, 1.0) * limb * lightFalloff;
      float edgeAlpha = 1.0 - smoothstep(0.94, 1.0, radius);
      fragColor = vec4(mix(darkSide, litSide, litMask), edgeAlpha * uAlpha);
    }
  )GLSL";
}

const char* celestialBodyFragmentShader() {
  return R"GLSL(
    #version 410 core

    uniform vec3 uColor;
    uniform float uRadiance;
    uniform int uDisc;
    uniform float uAlpha;

    in vec2 gUv;
    out vec4 fragColor;

    void main() {
      float radius = length(gUv);
      if (radius > 1.0) {
        discard;
      }

      float edgeAlpha = 1.0 - smoothstep(0.88, 1.0, radius);
      float center = 1.0 - smoothstep(0.0, 1.0, radius);
      float profile = uDisc != 0
        ? 0.92 + 0.08 * center
        : 0.32 + 0.68 * center * center;
      fragColor = vec4(uColor * uRadiance * profile, edgeAlpha * uAlpha);
    }
  )GLSL";
}

const char* guideVertexShader() {
  return R"GLSL(
    #version 410 core

    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec4 aColor;

    uniform mat4 uView;
    uniform mat4 uProjection;
    uniform float uAlphaScale;
    uniform float uFovRadians;
    uniform float uAspect;
    uniform float uFisheyeBlend;

    out vec4 vColor;

    void main() {
      vColor = vec4(aColor.rgb, aColor.a * uAlphaScale);
      vec4 viewPosition = uView * vec4(aPosition, 1.0);
      vec3 viewDirection = normalize(viewPosition.xyz);
      float angularDistance = acos(clamp(-viewDirection.z, -1.0, 1.0));
      float halfFov = uFovRadians * 0.5;
      float perspectiveCorner = atan(tan(halfFov) * sqrt(1.0 + uAspect * uAspect));
      float angularLimit = mix(perspectiveCorner, halfFov, uFisheyeBlend);
      vec4 perspectivePosition = uProjection * viewPosition;
      vec2 perspectiveNdc =
        perspectivePosition.xy / max(0.0001, abs(perspectivePosition.w));
      float radialLength = length(viewDirection.xy);
      float fisheyeRadius = angularDistance / max(0.01, uFovRadians * 0.5);
      vec2 fisheyeNdc = radialLength > 0.00001
        ? vec2(
            viewDirection.x / radialLength * fisheyeRadius / uAspect,
            viewDirection.y / radialLength * fisheyeRadius
          )
        : vec2(0.0);
      vec2 projectedNdc = mix(perspectiveNdc, fisheyeNdc, uFisheyeBlend);
      gl_ClipDistance[0] = angularLimit - angularDistance;
      gl_Position = uFisheyeBlend > 0.0
        ? vec4(projectedNdc, 0.0, 1.0)
        : perspectivePosition;
    }
  )GLSL";
}

const char* guideFragmentShader() {
  return R"GLSL(
    #version 410 core

    in vec4 vColor;
    out vec4 fragColor;

    void main() {
      fragColor = vColor;
    }
  )GLSL";
}

std::vector<GuideVertex> makeHorizonGuideVertices() {
  std::vector<GuideVertex> vertices;
  constexpr int segments = 192;
  vertices.reserve(static_cast<std::size_t>(segments * 2 + 4));

  for (int i = 0; i < segments; ++i) {
    const float a0 = static_cast<float>(i) / static_cast<float>(segments) * static_cast<float>(kTau);
    const float a1 = static_cast<float>(i + 1) / static_cast<float>(segments) * static_cast<float>(kTau);
    vertices.push_back({std::sin(a0) * kSkyRadius, 0.0f, -std::cos(a0) * kSkyRadius, 0.35f, 0.92f, 1.0f, 0.95f});
    vertices.push_back({std::sin(a1) * kSkyRadius, 0.0f, -std::cos(a1) * kSkyRadius, 0.35f, 0.92f, 1.0f, 0.95f});
  }

  const float markerZ = -kSkyRadius;
  vertices.push_back({0.0f, 0.0f, markerZ, 0.2f, 1.0f, 0.52f, 1.0f});
  vertices.push_back({0.0f, 34.0f, markerZ, 0.2f, 1.0f, 0.52f, 1.0f});

  vertices.push_back({0.0f, 0.0f, markerZ, 1.0f, 0.62f, 0.24f, 1.0f});
  vertices.push_back({0.0f, -34.0f, markerZ, 1.0f, 0.62f, 0.24f, 1.0f});

  return vertices;
}

void uploadGuideAttributes(GLuint vao, GLuint vbo, const std::vector<GuideVertex>& vertices) {
  glBindVertexArray(vao);
  glBindBuffer(GL_ARRAY_BUFFER, vbo);
  glBufferData(
    GL_ARRAY_BUFFER,
    static_cast<GLsizeiptr>(vertices.size() * sizeof(GuideVertex)),
    vertices.data(),
    GL_STATIC_DRAW
  );

  glEnableVertexAttribArray(0);
  glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(GuideVertex), reinterpret_cast<void*>(offsetof(GuideVertex, x)));
  glEnableVertexAttribArray(1);
  glVertexAttribPointer(1, 4, GL_FLOAT, GL_FALSE, sizeof(GuideVertex), reinterpret_cast<void*>(offsetof(GuideVertex, r)));
  glBindVertexArray(0);
}

void uploadStarAttributes(GLuint vao, GLuint vbo, const std::vector<StarVertex>& stars) {
  glBindVertexArray(vao);
  glBindBuffer(GL_ARRAY_BUFFER, vbo);
  glBufferData(
    GL_ARRAY_BUFFER,
    static_cast<GLsizeiptr>(stars.size() * sizeof(StarVertex)),
    stars.data(),
    GL_STATIC_DRAW
  );

  glEnableVertexAttribArray(0);
  glVertexAttribPointer(0, 1, GL_FLOAT, GL_FALSE, sizeof(StarVertex), reinterpret_cast<void*>(offsetof(StarVertex, ra)));
  glEnableVertexAttribArray(1);
  glVertexAttribPointer(1, 1, GL_FLOAT, GL_FALSE, sizeof(StarVertex), reinterpret_cast<void*>(offsetof(StarVertex, dec)));
  glEnableVertexAttribArray(2);
  glVertexAttribPointer(2, 1, GL_FLOAT, GL_FALSE, sizeof(StarVertex), reinterpret_cast<void*>(offsetof(StarVertex, pmRa)));
  glEnableVertexAttribArray(3);
  glVertexAttribPointer(3, 1, GL_FLOAT, GL_FALSE, sizeof(StarVertex), reinterpret_cast<void*>(offsetof(StarVertex, pmDec)));
  glEnableVertexAttribArray(4);
  glVertexAttribPointer(4, 1, GL_FLOAT, GL_FALSE, sizeof(StarVertex), reinterpret_cast<void*>(offsetof(StarVertex, magnitude)));
  glEnableVertexAttribArray(5);
  glVertexAttribPointer(5, 3, GL_FLOAT, GL_FALSE, sizeof(StarVertex), reinterpret_cast<void*>(offsetof(StarVertex, colorR)));

  glBindVertexArray(0);
}

void applyGuiSettings(AppState& app) {
  app.animation.durationSeconds = std::max(0.1, static_cast<double>(app.gui.durationSeconds));
  app.animation.curve.inertiaPortion = clamp(static_cast<double>(app.gui.inertiaPortion), 0.0, 0.8);
  app.animation.curve.driftProgress = clamp(static_cast<double>(app.gui.driftPercent) / 100.0, 0.0, 0.2);
  app.animation.curve.power = clamp(static_cast<double>(app.gui.power), 1.0, 8.0);
  app.location.latitudeRadians = static_cast<double>(app.gui.latitudeDegrees) * kDegToRad;
  app.location.longitudeRadians = static_cast<double>(app.gui.longitudeDegrees) * kDegToRad;
}

void restartAnimation(AppState& app, double now) {
  applyGuiSettings(app);
  app.animation.startYear = static_cast<double>(app.gui.startYear);
  app.animation.currentYear = app.animation.startYear;
  app.animation.targetYear = app.animation.startYear - static_cast<double>(app.gui.rewindYears);
  app.animation.startedAt = now;
  app.animation.pausedAt = 0.0;
  app.animation.pausedDuration = 0.0;
  app.animation.speed = 0.0;
  app.animation.motionStrength = 0.0;
  app.animation.active = true;
  app.animation.paused = false;
}

void updateAnimation(AnimationState& animation, double now, double deltaSeconds) {
  if (!animation.active || animation.paused) {
    animation.speed = 0.0;
    animation.motionStrength = 0.0;
    return;
  }

  const double raw = clamp((now - animation.startedAt - animation.pausedDuration) / animation.durationSeconds, 0.0, 1.0);
  const double eased = cinematicInertiaEase(raw, animation.curve);
  const double previousYear = animation.currentYear;
  animation.currentYear = animation.startYear + (animation.targetYear - animation.startYear) * eased;
  animation.speed = (animation.currentYear - previousYear) / std::max(0.001, deltaSeconds);
  animation.motionStrength = normalizedMotionStrength(animation.speed, animation.startYear, animation.targetYear, animation.durationSeconds);

  if (raw >= 1.0) {
    animation.currentYear = animation.targetYear;
    animation.active = false;
    animation.speed = 0.0;
    animation.motionStrength = 0.0;
  }
}

float maxMagnitudeForSpeed(double cinematicStrength, float faintMagnitudeLimit, float brightMagnitudeLimit) {
  const double speed = clamp(cinematicStrength, 0.0, 1.0);
  return faintMagnitudeLimit - static_cast<float>(std::pow(speed, 0.62)) * (faintMagnitudeLimit - brightMagnitudeLimit);
}

ZoetropeState makeZoetropeState(const AppState& app) {
  ZoetropeState state{app.animation.currentYear, app.animation.currentYear, 0.0f, 0.0f};
  if (app.gui.longExposure || !app.gui.zoetropeSampling || !app.animation.active || app.animation.paused) {
    return state;
  }

  const double totalTravel = std::abs(app.animation.targetYear - app.animation.startYear);
  const double interval = std::max(1.0, static_cast<double>(app.gui.zoetropeIntervalYears));
  if (totalTravel <= interval * 0.25) {
    return state;
  }

  const double direction = app.animation.targetYear >= app.animation.startYear ? 1.0 : -1.0;
  const double travelled = clamp(std::abs(app.animation.currentYear - app.animation.startYear), 0.0, totalTravel);
  const double stepIndex = std::floor(travelled / interval);
  const double stepStart = std::min(stepIndex * interval, totalTravel);
  const double stepEnd = std::min(stepStart + interval, totalTravel);
  const double stepSize = std::max(0.001, stepEnd - stepStart);
  const double local = clamp((travelled - stepStart) / stepSize, 0.0, 1.0);
  const double blendPortion = clamp(static_cast<double>(app.gui.zoetropeBlendPortion), 0.02, 0.75);
  const double blendStart = 1.0 - blendPortion;
  const double blend = smoothStep01((local - blendStart) / blendPortion);

  state.primaryYear = app.animation.startYear + direction * stepStart;
  state.secondaryYear = app.animation.startYear + direction * stepEnd;
  state.secondaryAlpha = static_cast<float>(blend);
  state.lockPulse = static_cast<float>((1.0 - blend) * (1.0 - smoothStep01(local / std::max(0.001, blendStart))));
  return state;
}

void orientCameraTowardMoon(AppState& app, double visibleYear) {
  const MoonState moon = moonState(visibleYear, app.location);
  const float horizontalLength = std::hypot(moon.direction.east, moon.direction.north);
  if (horizontalLength > 0.00001f) {
    app.camera.yaw = std::atan2(moon.direction.east, moon.direction.north);
  }
  app.camera.pitch = std::asin(clampFloat(moon.direction.up, -1.0f, 1.0f));
}

void centerViewportOnMoon(AppState& app) {
  const double visibleYear = app.visibleProgram == VisibleProgram::TimePlayer
    ? app.timePlayer.currentYear
    : makeZoetropeState(app).primaryYear;
  orientCameraTowardMoon(app, visibleYear);
}

double moonPathTimeDirection(const AppState& app) {
  if (app.visibleProgram == VisibleProgram::TimePlayer) {
    return app.timePlayer.rateDirection < 0.0 ? -1.0 : 1.0;
  }
  return app.animation.targetYear < app.animation.startYear ? -1.0 : 1.0;
}

void frameViewportAroundMoonPath(AppState& app) {
  const double visibleYear = app.visibleProgram == VisibleProgram::TimePlayer
    ? app.timePlayer.currentYear
    : makeZoetropeState(app).primaryYear;
  const float viewportAspect =
    static_cast<float>(app.framebufferWidth) /
    static_cast<float>(std::max(1, app.framebufferHeight));
  const MoonPathFrame frame = frameMoonPath(
    visibleYear,
    static_cast<double>(app.gui.moonPathHours) * moonPathTimeDirection(app),
    app.location,
    viewportAspect,
    kMinimumFovDegrees * static_cast<float>(kDegToRad),
    kMaximumFovDegrees * static_cast<float>(kDegToRad)
  );
  const float horizontalLength =
    std::hypot(frame.center.east, frame.center.north);
  if (horizontalLength > 0.00001f) {
    app.camera.yaw = std::atan2(frame.center.east, frame.center.north);
  }
  app.camera.pitch =
    std::asin(clampFloat(frame.center.up, -1.0f, 1.0f));
  app.camera.fovRadians = frame.verticalFovRadians;
  app.gui.projectionMode = frame.useFisheye
    ? ProjectionMode::AdaptiveFisheye
    : ProjectionMode::Perspective;
  app.gui.moonTrackingMode = MoonTrackingMode::Off;
  app.gui.moonPathFrameClipped = frame.clipped;
}

void drawMoonCameraControls(AppState& app, const char* id) {
  ImGui::PushID(id);
  ImGui::BeginDisabled(!app.gui.showMoon);
  int trackingMode = static_cast<int>(app.gui.moonTrackingMode);
  if (ImGui::Combo(
        "Moon tracking",
        &trackingMode,
        "Off\0Horizon up\0Sky stabilized\0"
      )) {
    app.gui.moonTrackingMode = static_cast<MoonTrackingMode>(trackingMode);
    if (app.gui.moonTrackingMode != MoonTrackingMode::Off) {
      centerViewportOnMoon(app);
    }
  }
  if (ImGui::Button("Center moon")) {
    centerViewportOnMoon(app);
  }
  if (ImGui::SliderFloat(
    "Moon path span",
    &app.gui.moonPathHours,
    1.0f,
    72.0f,
    "%.0f hr"
  )) {
    app.gui.moonPathFrameClipped = false;
  }
  if (ImGui::Button("Frame moon path")) {
    frameViewportAroundMoonPath(app);
  }
  ImGui::SameLine();
  ImGui::TextDisabled(
    "%s from current time",
    moonPathTimeDirection(app) < 0.0 ? "backward" : "forward"
  );
  if (app.gui.moonPathFrameClipped) {
    ImGui::TextColored(
      ImVec4(1.0f, 0.72f, 0.28f, 1.0f),
      "Path exceeds the %.0f degree FOV limit.",
      kMaximumFovDegrees
    );
  }
  ImGui::EndDisabled();
  ImGui::PopID();
}

void drawSolarSystemControls(AppState& app, const char* id) {
  ImGui::PushID(id);
  ImGui::Checkbox("Sun", &app.gui.showSun);
  ImGui::SameLine();
  ImGui::Checkbox("Mercury through Saturn", &app.gui.showPlanets);
  ImGui::SliderFloat(
    "Solar-system size",
    &app.gui.solarSystemSizeScale,
    0.5f,
    3.0f,
    "%.2f"
  );
  ImGui::PopID();
}

void drawProjectionControls(AppState& app, const char* id) {
  ImGui::PushID(id);
  int projectionMode = static_cast<int>(app.gui.projectionMode);
  if (ImGui::Combo(
        "Projection",
        &projectionMode,
        "Perspective\0Wide-angle fisheye\0Calibrated flat display\0"
      )) {
    app.gui.projectionMode = static_cast<ProjectionMode>(projectionMode);
  }

  if (app.gui.projectionMode == ProjectionMode::CalibratedDisplay) {
    ImGui::SliderFloat(
      "Rendered width",
      &app.gui.physicalDisplay.surfaceWidthCentimeters,
      10.0f,
      300.0f,
      "%.1f cm"
    );
    ImGui::SliderFloat(
      "Rendered height",
      &app.gui.physicalDisplay.surfaceHeightCentimeters,
      10.0f,
      200.0f,
      "%.1f cm"
    );
    ImGui::SliderFloat(
      "Eye distance",
      &app.gui.physicalDisplay.eyeDistanceCentimeters,
      5.0f,
      300.0f,
      "%.1f cm",
      ImGuiSliderFlags_Logarithmic
    );
    const float viewportAspect =
      static_cast<float>(app.framebufferWidth) /
      static_cast<float>(std::max(1, app.framebufferHeight));
    const ViewProjection projection = makeViewProjection(
      app.gui.projectionMode,
      app.camera.fovRadians,
      viewportAspect,
      app.gui.physicalDisplay
    );
    ImGui::Text(
      "Physical FOV: %.1f horizontal x %.1f vertical",
      projection.horizontalFovRadians / static_cast<float>(kDegToRad),
      projection.verticalFovRadians / static_cast<float>(kDegToRad)
    );
    const float physicalAspect =
      app.gui.physicalDisplay.surfaceWidthCentimeters /
      std::max(0.01f, app.gui.physicalDisplay.surfaceHeightCentimeters);
    if (std::abs(physicalAspect - viewportAspect) / viewportAspect > 0.02f) {
      ImGui::TextColored(
        ImVec4(1.0f, 0.72f, 0.28f, 1.0f),
        "Rendered dimensions must match the window's %.3f aspect.",
        viewportAspect
      );
    }
    ImGui::TextDisabled("Measure only the rendered area and keep your eyes centered.");
  } else {
    ImGui::SliderAngle(
      "Field of view",
      &app.camera.fovRadians,
      kMinimumFovDegrees,
      kMaximumFovDegrees,
      "%.0f deg"
    );
  }
  ImGui::PopID();
}

void drawHdrControls(AppState& app, const char* id) {
  ImGui::PushID(id);
  ImGui::Checkbox("HDR output", &app.gui.hdrOutput);
  ImGui::BeginDisabled(!app.gui.hdrOutput);
  ImGui::SliderFloat("Exposure", &app.gui.hdrExposure, -4.0f, 4.0f, "%+.1f EV");
  if (app.extendedRange.floatingPointSurface &&
      app.extendedRange.currentHeadroom > 1.001f) {
    ImGui::Text(
      "XDR active: %.2fx headroom",
      app.extendedRange.currentHeadroom
    );
  } else if (app.extendedRange.displayCapable) {
    ImGui::Text(
      "XDR display: SDR fallback (potential %.2fx)",
      app.extendedRange.potentialHeadroom
    );
  } else {
    ImGui::Text("SDR tone mapping");
  }
  ImGui::EndDisabled();
  ImGui::PopID();
}

int hdrOutputMode(const AppState& app) {
  if (!app.gui.hdrOutput) {
    return 0;
  }
  return app.extendedRange.floatingPointSurface &&
      app.extendedRange.currentHeadroom > 1.001f
    ? 2
    : 1;
}

ProjectionUniforms projectionForLayer(double year, const Location& location, float siderealOffset, float precessionOffset) {
  ProjectionUniforms projection = makeProjectionUniforms(year, location);
  projection.localSiderealTime += siderealOffset;
  projection.zeta += precessionOffset;
  projection.z += precessionOffset * 0.72f;
  return projection;
}

void drawStarPass(
  const GlProgram& program,
  GLuint vao,
  std::size_t starCount,
  const Mat4& viewMatrix,
  const Mat4& projectionMatrix,
  const ProjectionUniforms& projection,
  float maxVisibleMagnitude,
  float cinematicStrength,
  float hdrHighlightScale,
  float starSizeScale,
  float layerAlpha,
  float layerBlueShift,
  float atmosphereWarp,
  float effectClock,
  float fovRadians,
  float aspect,
  float fisheyeBlend
) {
  glUseProgram(program.id);
  glUniformMatrix4fv(glGetUniformLocation(program.id, "uView"), 1, GL_FALSE, viewMatrix.m.data());
  glUniformMatrix4fv(glGetUniformLocation(program.id, "uProjection"), 1, GL_FALSE, projectionMatrix.m.data());
  glUniform1f(glGetUniformLocation(program.id, "uYearsSinceCatalog"), projection.yearsSinceCatalog);
  glUniform1f(glGetUniformLocation(program.id, "uZeta"), projection.zeta);
  glUniform1f(glGetUniformLocation(program.id, "uZ"), projection.z);
  glUniform1f(glGetUniformLocation(program.id, "uCosTheta"), projection.cosTheta);
  glUniform1f(glGetUniformLocation(program.id, "uSinTheta"), projection.sinTheta);
  glUniform1f(glGetUniformLocation(program.id, "uLocalSiderealTime"), projection.localSiderealTime);
  glUniform1f(glGetUniformLocation(program.id, "uSinLat"), projection.sinLatitude);
  glUniform1f(glGetUniformLocation(program.id, "uCosLat"), projection.cosLatitude);
  glUniform1f(glGetUniformLocation(program.id, "uSkyRadius"), kSkyRadius);
  glUniform1f(glGetUniformLocation(program.id, "uMaxVisibleMagnitude"), maxVisibleMagnitude);
  glUniform1f(glGetUniformLocation(program.id, "uCinematicStrength"), cinematicStrength);
  glUniform1f(glGetUniformLocation(program.id, "uHdrHighlightScale"), hdrHighlightScale);
  glUniform1f(glGetUniformLocation(program.id, "uStarSizeScale"), starSizeScale);
  glUniform1f(glGetUniformLocation(program.id, "uLayerAlpha"), layerAlpha);
  glUniform1f(glGetUniformLocation(program.id, "uLayerBlueShift"), layerBlueShift);
  glUniform1f(glGetUniformLocation(program.id, "uAtmosphereWarp"), atmosphereWarp);
  glUniform1f(glGetUniformLocation(program.id, "uEffectClock"), effectClock);
  glUniform1f(glGetUniformLocation(program.id, "uFovRadians"), fovRadians);
  glUniform1f(glGetUniformLocation(program.id, "uAspect"), aspect);
  glUniform1f(glGetUniformLocation(program.id, "uFisheyeBlend"), fisheyeBlend);
  glBindVertexArray(vao);
  glDrawArrays(GL_POINTS, 0, static_cast<GLsizei>(starCount));
}

void setStarTrailProjection(
  GLuint program,
  const char* prefix,
  const ProjectionUniforms& projection
) {
  const auto uniform = [&](const char* suffix) {
    return glGetUniformLocation(
      program,
      (std::string(prefix) + suffix).c_str()
    );
  };
  glUniform1f(uniform("YearsSinceCatalog"), projection.yearsSinceCatalog);
  glUniform1f(uniform("Zeta"), projection.zeta);
  glUniform1f(uniform("Z"), projection.z);
  glUniform1f(uniform("CosTheta"), projection.cosTheta);
  glUniform1f(uniform("SinTheta"), projection.sinTheta);
  glUniform1f(
    uniform("LocalSiderealTime"),
    projection.localSiderealTime
  );
}

void drawStarTrailPass(
  const GlProgram& program,
  GLuint vao,
  std::size_t starCount,
  const Mat4& viewMatrix,
  const Mat4& projectionMatrix,
  const ProjectionUniforms& startProjection,
  const ProjectionUniforms& endProjection,
  float maxVisibleMagnitude,
  float cinematicStrength,
  float hdrHighlightScale,
  float starSizeScale,
  float trailAlpha,
  float segmentStartProgress,
  float segmentEndProgress,
  bool capStart,
  bool capEnd,
  StreakStyle streakStyle,
  float fixedWidthPixels,
  int viewportWidth,
  int viewportHeight,
  float fovRadians,
  float aspect,
  float fisheyeBlend
) {
  glUseProgram(program.id);
  glUniformMatrix4fv(
    glGetUniformLocation(program.id, "uView"),
    1,
    GL_FALSE,
    viewMatrix.m.data()
  );
  glUniformMatrix4fv(
    glGetUniformLocation(program.id, "uProjection"),
    1,
    GL_FALSE,
    projectionMatrix.m.data()
  );
  setStarTrailProjection(
    program.id,
    "uStart",
    startProjection
  );
  setStarTrailProjection(
    program.id,
    "uEnd",
    endProjection
  );
  glUniform1f(
    glGetUniformLocation(program.id, "uSinLat"),
    endProjection.sinLatitude
  );
  glUniform1f(
    glGetUniformLocation(program.id, "uCosLat"),
    endProjection.cosLatitude
  );
  glUniform1f(
    glGetUniformLocation(program.id, "uSkyRadius"),
    kSkyRadius
  );
  glUniform1f(
    glGetUniformLocation(program.id, "uMaxVisibleMagnitude"),
    maxVisibleMagnitude
  );
  glUniform1f(
    glGetUniformLocation(program.id, "uCinematicStrength"),
    cinematicStrength
  );
  glUniform1f(
    glGetUniformLocation(program.id, "uHdrHighlightScale"),
    hdrHighlightScale
  );
  glUniform1f(
    glGetUniformLocation(program.id, "uStarSizeScale"),
    starSizeScale
  );
  glUniform1f(
    glGetUniformLocation(program.id, "uTrailAlpha"),
    trailAlpha
  );
  glUniform1f(
    glGetUniformLocation(program.id, "uSegmentStartProgress"),
    segmentStartProgress
  );
  glUniform1f(
    glGetUniformLocation(program.id, "uSegmentEndProgress"),
    segmentEndProgress
  );
  glUniform1i(
    glGetUniformLocation(program.id, "uCapStart"),
    capStart ? 1 : 0
  );
  glUniform1i(
    glGetUniformLocation(program.id, "uCapEnd"),
    capEnd ? 1 : 0
  );
  glUniform1i(
    glGetUniformLocation(program.id, "uStreakStyle"),
    static_cast<int>(streakStyle)
  );
  glUniform1f(
    glGetUniformLocation(program.id, "uFixedWidthPixels"),
    fixedWidthPixels
  );
  glUniform2f(
    glGetUniformLocation(program.id, "uViewport"),
    static_cast<float>(viewportWidth),
    static_cast<float>(viewportHeight)
  );
  glUniform1f(
    glGetUniformLocation(program.id, "uFovRadians"),
    fovRadians
  );
  glUniform1f(glGetUniformLocation(program.id, "uAspect"), aspect);
  glUniform1f(
    glGetUniformLocation(program.id, "uFisheyeBlend"),
    fisheyeBlend
  );
  glBindVertexArray(vao);
  glDrawArrays(GL_POINTS, 0, static_cast<GLsizei>(starCount));
}

void drawMoonPass(
  const GlProgram& program,
  GLuint vao,
  const Mat4& viewMatrix,
  const Mat4& projectionMatrix,
  double year,
  const Location& location,
  int viewportWidth,
  int viewportHeight,
  float fovRadians,
  float perspectiveAspect,
  float fisheyeBlend,
  float sizePixels,
  float alpha
) {
  const MoonState moon = moonState(year, location);
  const float aspect = perspectiveAspect;
  const Vec3 moonInView = normalize(transformDirection(
    viewMatrix,
    {
      moon.direction.east,
      moon.direction.up,
      -moon.direction.north,
    }
  ));
  const Vec3 sunInView = normalize(transformDirection(
    viewMatrix,
    {
      moon.sunDirection.east,
      moon.sunDirection.up,
      -moon.sunDirection.north,
    }
  ));
  glUseProgram(program.id);
  glUniformMatrix4fv(glGetUniformLocation(program.id, "uView"), 1, GL_FALSE, viewMatrix.m.data());
  glUniformMatrix4fv(glGetUniformLocation(program.id, "uProjection"), 1, GL_FALSE, projectionMatrix.m.data());
  glUniform3f(
    glGetUniformLocation(program.id, "uBodyPosition"),
    moon.direction.east * kSkyRadius,
    moon.direction.up * kSkyRadius,
    -moon.direction.north * kSkyRadius
  );
  glUniform2f(
    glGetUniformLocation(program.id, "uViewport"),
    static_cast<float>(viewportWidth),
    static_cast<float>(viewportHeight)
  );
  glUniform1f(glGetUniformLocation(program.id, "uSizePixels"), sizePixels);
  glUniform1f(glGetUniformLocation(program.id, "uAlpha"), alpha);
  glUniform1f(glGetUniformLocation(program.id, "uFovRadians"), fovRadians);
  glUniform1f(glGetUniformLocation(program.id, "uAspect"), aspect);
  glUniform1f(glGetUniformLocation(program.id, "uFisheyeBlend"), fisheyeBlend);

  const float moonSunCosine = clampFloat(dot(moonInView, sunInView), -1.0f, 1.0f);
  const Vec3 tangent = {
    sunInView.x - moonInView.x * moonSunCosine,
    sunInView.y - moonInView.y * moonSunCosine,
    sunInView.z - moonInView.z * moonSunCosine,
  };
  const float tangentLength = std::sqrt(std::max(0.0f, dot(tangent, tangent)));
  Vec2 screenLightDirection{};
  if (tangentLength > 0.00001f) {
    const Vec3 tangentDirection = {
      tangent.x / tangentLength,
      tangent.y / tangentLength,
      tangent.z / tangentLength,
    };
    const Vec3 lightSample = normalize({
      moonInView.x + tangentDirection.x * 0.001f,
      moonInView.y + tangentDirection.y * 0.001f,
      moonInView.z + tangentDirection.z * 0.001f,
    });
    const Vec2 moonNdc =
      projectSkyDirection(moonInView, fovRadians, aspect, fisheyeBlend);
    const Vec2 lightNdc =
      projectSkyDirection(lightSample, fovRadians, aspect, fisheyeBlend);
    const float screenLength = std::hypot(
      lightNdc.x - moonNdc.x,
      lightNdc.y - moonNdc.y
    );
    if (screenLength > 0.000001f) {
      screenLightDirection = {
        (lightNdc.x - moonNdc.x) / screenLength,
        (lightNdc.y - moonNdc.y) / screenLength,
      };
    } else {
      screenLightDirection = {1.0f, 0.0f};
    }
  }
  glUniform3f(
    glGetUniformLocation(program.id, "uLightDirection"),
    screenLightDirection.x * tangentLength,
    screenLightDirection.y * tangentLength,
    -moonSunCosine
  );
  glBindVertexArray(vao);
  glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
  glDrawArrays(GL_POINTS, 0, 1);
  glBlendFunc(GL_SRC_ALPHA, GL_ONE);
}

void drawSolarSystemPass(
  const GlProgram& program,
  GLuint vao,
  const Mat4& viewMatrix,
  const Mat4& projectionMatrix,
  double year,
  const Location& location,
  int viewportWidth,
  int viewportHeight,
  float fovRadians,
  float perspectiveAspect,
  float fisheyeBlend,
  float sizeScale,
  float alpha,
  bool showSun,
  bool showPlanets,
  bool hdrOutput
) {
  if (!showSun && !showPlanets) {
    return;
  }

  const float aspect = perspectiveAspect;
  const float perspectivePixelsPerRadian =
    static_cast<float>(std::max(1, viewportHeight)) /
    (2.0f * std::tan(std::max(0.01f, fovRadians) * 0.5f));
  const float fisheyePixelsPerRadian =
    static_cast<float>(std::max(1, viewportHeight)) / std::max(0.01f, fovRadians);
  const float pixelsPerRadian =
    perspectivePixelsPerRadian +
    (fisheyePixelsPerRadian - perspectivePixelsPerRadian) * fisheyeBlend;

  glUseProgram(program.id);
  glUniformMatrix4fv(
    glGetUniformLocation(program.id, "uView"),
    1,
    GL_FALSE,
    viewMatrix.m.data()
  );
  glUniformMatrix4fv(
    glGetUniformLocation(program.id, "uProjection"),
    1,
    GL_FALSE,
    projectionMatrix.m.data()
  );
  glUniform2f(
    glGetUniformLocation(program.id, "uViewport"),
    static_cast<float>(viewportWidth),
    static_cast<float>(viewportHeight)
  );
  glUniform1f(glGetUniformLocation(program.id, "uFovRadians"), fovRadians);
  glUniform1f(glGetUniformLocation(program.id, "uAspect"), aspect);
  glUniform1f(glGetUniformLocation(program.id, "uFisheyeBlend"), fisheyeBlend);
  glUniform1f(glGetUniformLocation(program.id, "uAlpha"), alpha);
  glBindVertexArray(vao);
  glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

  for (const SolarSystemBodyState& state : solarSystemState(year, location)) {
    const bool isSun = state.body == SolarSystemBody::Sun;
    if ((isSun && !showSun) || (!isSun && !showPlanets)) {
      continue;
    }

    const float physicalSize =
      state.angularDiameterRadians * pixelsPerRadian;
    const float artisticSize = isSun
      ? 14.0f
      : clampFloat(7.0f - state.apparentMagnitude * 0.85f, 4.0f, 13.0f);
    const float sizePixels =
      std::max(physicalSize, artisticSize) * sizeScale;
    float radiance = isSun
      ? 12.0f
      : clampFloat(1.15f - state.apparentMagnitude * 0.62f, 0.35f, 4.5f);
    if (!hdrOutput) {
      radiance = std::min(1.0f, radiance);
    }

    glUniform3f(
      glGetUniformLocation(program.id, "uBodyPosition"),
      state.direction.east * kSkyRadius,
      state.direction.up * kSkyRadius,
      -state.direction.north * kSkyRadius
    );
    glUniform1f(glGetUniformLocation(program.id, "uSizePixels"), sizePixels);
    glUniform3f(
      glGetUniformLocation(program.id, "uColor"),
      state.color[0],
      state.color[1],
      state.color[2]
    );
    glUniform1f(glGetUniformLocation(program.id, "uRadiance"), radiance);
    glUniform1i(glGetUniformLocation(program.id, "uDisc"), isSun ? 1 : 0);
    glDrawArrays(GL_POINTS, 0, 1);
  }

  glBlendFunc(GL_SRC_ALPHA, GL_ONE);
}

void keyCallback(GLFWwindow* window, int key, int, int action, int) {
  ImGui_ImplGlfw_KeyCallback(window, key, 0, action, 0);
  if (action != GLFW_PRESS) {
    return;
  }

  auto* app = static_cast<AppState*>(glfwGetWindowUserPointer(window));
  if (key == GLFW_KEY_F1) {
    app->gui.showControls = !app->gui.showControls;
    return;
  }
  if (key == GLFW_KEY_F2) {
    app->timePlayer.showWindow = !app->timePlayer.showWindow;
    return;
  }
  if (key == GLFW_KEY_ESCAPE) {
    glfwSetWindowShouldClose(window, GLFW_TRUE);
    return;
  }
  if (ImGui::GetIO().WantCaptureKeyboard) {
    return;
  }
  if (key == GLFW_KEY_R) {
    app->visibleProgram = VisibleProgram::CinematicRewind;
    restartAnimation(*app, glfwGetTime());
    return;
  }
  if (key == GLFW_KEY_SPACE) {
    const double now = glfwGetTime();
    if (!app->animation.active) {
      app->visibleProgram = VisibleProgram::CinematicRewind;
      restartAnimation(*app, now);
      return;
    }
    if (app->animation.paused) {
      app->visibleProgram = VisibleProgram::CinematicRewind;
      app->animation.pausedDuration += now - app->animation.pausedAt;
      app->animation.paused = false;
    } else {
      app->animation.pausedAt = now;
      app->animation.paused = true;
    }
  }
}

void cursorCallback(GLFWwindow* window, double x, double y) {
  ImGui_ImplGlfw_CursorPosCallback(window, x, y);
  auto* app = static_cast<AppState*>(glfwGetWindowUserPointer(window));
  if (!app->camera.dragging || ImGui::GetIO().WantCaptureMouse) {
    return;
  }

  const double dx = x - app->camera.pointerX;
  const double dy = y - app->camera.pointerY;
  app->camera.pointerX = x;
  app->camera.pointerY = y;
  app->camera.yaw -= static_cast<float>(dx * 0.004);
  app->camera.pitch = clampFloat(app->camera.pitch - static_cast<float>(dy * 0.004), -1.45f, 1.45f);
}

void mouseButtonCallback(GLFWwindow* window, int button, int action, int) {
  ImGui_ImplGlfw_MouseButtonCallback(window, button, action, 0);
  if (button != GLFW_MOUSE_BUTTON_LEFT) {
    return;
  }

  auto* app = static_cast<AppState*>(glfwGetWindowUserPointer(window));
  if (ImGui::GetIO().WantCaptureMouse) {
    app->camera.dragging = false;
    return;
  }
  if (action == GLFW_PRESS) {
    app->gui.moonTrackingMode = MoonTrackingMode::Off;
  }
  app->camera.dragging = action == GLFW_PRESS;
  glfwGetCursorPos(window, &app->camera.pointerX, &app->camera.pointerY);
}

void scrollCallback(GLFWwindow* window, double, double yOffset) {
  ImGui_ImplGlfw_ScrollCallback(window, 0.0, yOffset);
  if (ImGui::GetIO().WantCaptureMouse) {
    return;
  }
  auto* app = static_cast<AppState*>(glfwGetWindowUserPointer(window));
  if (app->gui.projectionMode == ProjectionMode::CalibratedDisplay) {
    return;
  }
  const float fovDegrees = app->camera.fovRadians / static_cast<float>(kDegToRad);
  const float nextDegrees = clampFloat(
    fovDegrees - static_cast<float>(yOffset) * 2.0f,
    kMinimumFovDegrees,
    kMaximumFovDegrees
  );
  app->camera.fovRadians = nextDegrees * static_cast<float>(kDegToRad);
}

void charCallback(GLFWwindow* window, unsigned int codepoint) {
  ImGui_ImplGlfw_CharCallback(window, codepoint);
}

void framebufferSizeCallback(GLFWwindow* window, int width, int height) {
  auto* app = static_cast<AppState*>(glfwGetWindowUserPointer(window));
  app->framebufferWidth = std::max(1, width);
  app->framebufferHeight = std::max(1, height);
  glViewport(0, 0, app->framebufferWidth, app->framebufferHeight);
}

void drawMoonIcon(float size) {
  ImDrawList* drawList = ImGui::GetWindowDrawList();
  const ImVec2 cursor = ImGui::GetCursorScreenPos();
  const ImVec2 center(cursor.x + size * 0.5f, cursor.y + size * 0.5f);
  const float badgeRadius = size * 0.46f;
  const float moonRadius = size * 0.3f;
  drawList->AddCircleFilled(center, badgeRadius, IM_COL32(10, 17, 32, 255), 48);
  drawList->AddCircleFilled(ImVec2(center.x + size * 0.04f, center.y), moonRadius, IM_COL32(230, 242, 255, 255), 48);
  drawList->AddCircleFilled(ImVec2(center.x - size * 0.12f, center.y), moonRadius * 0.98f, IM_COL32(10, 17, 32, 255), 48);
  drawList->AddCircle(center, badgeRadius, IM_COL32(92, 224, 255, 185), 48, 1.5f);
  ImGui::Dummy(ImVec2(size, size));
}

TimeCurve curveFromGui(const GuiState& gui) {
  return {
    clamp(static_cast<double>(gui.inertiaPortion), 0.0, 0.8),
    clamp(static_cast<double>(gui.driftPercent) / 100.0, 0.0, 0.2),
    clamp(static_cast<double>(gui.power), 1.0, 8.0),
  };
}

double currentCurveProgress(const AnimationState& animation) {
  if (!animation.active) {
    return 1.0;
  }
  if (animation.paused) {
    return clamp((animation.pausedAt - animation.startedAt - animation.pausedDuration) / animation.durationSeconds, 0.0, 1.0);
  }
  return clamp((glfwGetTime() - animation.startedAt - animation.pausedDuration) / animation.durationSeconds, 0.0, 1.0);
}

void drawCurvePreview(const AppState& app) {
  const TimeCurve curve = curveFromGui(app.gui);
  const ImVec2 size(ImGui::GetContentRegionAvail().x, 150.0f);
  ImGui::InvisibleButton("curve-preview", size);

  const ImVec2 min = ImGui::GetItemRectMin();
  const ImVec2 max = ImGui::GetItemRectMax();
  ImDrawList* drawList = ImGui::GetWindowDrawList();
  const ImU32 background = IM_COL32(7, 12, 23, 230);
  const ImU32 border = IM_COL32(80, 145, 176, 160);
  const ImU32 grid = IM_COL32(82, 128, 150, 58);
  const ImU32 curveColor = IM_COL32(127, 220, 255, 255);
  const ImU32 driftColor = IM_COL32(255, 214, 116, 160);
  const ImU32 markerColor = IM_COL32(121, 255, 165, 255);
  const float width = max.x - min.x;
  const float height = max.y - min.y;

  drawList->AddRectFilled(min, max, background, 8.0f);
  drawList->AddRect(min, max, border, 8.0f);
  for (int i = 1; i < 4; ++i) {
    const float x = min.x + width * static_cast<float>(i) / 4.0f;
    const float y = min.y + height * static_cast<float>(i) / 4.0f;
    drawList->AddLine(ImVec2(x, min.y), ImVec2(x, max.y), grid);
    drawList->AddLine(ImVec2(min.x, y), ImVec2(max.x, y), grid);
  }

  std::array<ImVec2, 128> points;
  for (std::size_t i = 0; i < points.size(); ++i) {
    const double t = static_cast<double>(i) / static_cast<double>(points.size() - 1);
    const double y = cinematicInertiaEase(t, curve);
    points[i] = ImVec2(
      min.x + static_cast<float>(t) * width,
      max.y - static_cast<float>(y) * height
    );
  }
  drawList->AddPolyline(points.data(), static_cast<int>(points.size()), curveColor, ImDrawFlags_None, 2.4f);

  const float inertiaX = min.x + static_cast<float>(curve.inertiaPortion) * width;
  drawList->AddLine(ImVec2(inertiaX, min.y), ImVec2(inertiaX, max.y), driftColor, 1.5f);
  drawList->AddText(ImVec2(min.x + 8.0f, min.y + 8.0f), IM_COL32(180, 216, 235, 215), "time");
  drawList->AddText(ImVec2(max.x - 70.0f, max.y - 22.0f), IM_COL32(180, 216, 235, 215), "sky time");

  const double progress = currentCurveProgress(app.animation);
  const double eased = cinematicInertiaEase(progress, curve);
  const ImVec2 marker(
    min.x + static_cast<float>(progress) * width,
    max.y - static_cast<float>(eased) * height
  );
  drawList->AddLine(ImVec2(marker.x, min.y), ImVec2(marker.x, max.y), markerColor, 1.0f);
  drawList->AddCircleFilled(marker, 4.4f, markerColor, 20);

  ImGui::Text(
    "preview: %.1f%% input -> %.3f%% output",
    progress * 100.0,
    eased * 100.0
  );
}

const char* visibleProgramName(VisibleProgram program) {
  return program == VisibleProgram::TimePlayer ? "time player" : "cinematic rewind";
}

void setTimePlayerDirection(AppState& app, double direction) {
  app.timePlayer.rateDirection = direction;
  syncTimePlayerSpeed(app.timePlayer);
  app.visibleProgram = VisibleProgram::TimePlayer;
}

void drawTimePlayerControls(AppState& app) {
  if (!app.timePlayer.showWindow) {
    return;
  }

  ImGui::SetNextWindowSize(ImVec2(370.0f, 0.0f), ImGuiCond_FirstUseEver);
  ImGui::SetNextWindowPos(ImVec2(410.0f, 28.0f), ImGuiCond_FirstUseEver);
  ImGui::Begin("Starfield Time Player", &app.timePlayer.showWindow);
  ImGui::Text("Simple starfield playback");
  ImGui::TextDisabled("Long exposure is shared with the cinematic sky.");
  ImGui::Separator();

  if (ImGui::Button(app.timePlayer.playing ? "Pause" : "Play")) {
    app.timePlayer.playing = !app.timePlayer.playing;
    if (app.timePlayer.playing) {
      if (app.timePlayer.rateDirection == 0.0) {
        app.timePlayer.rateDirection = -1.0;
      }
      syncTimePlayerSpeed(app.timePlayer);
      app.visibleProgram = VisibleProgram::TimePlayer;
    }
  }
  ImGui::SameLine();
  if (ImGui::Button("Use visible sky")) {
    app.visibleProgram = VisibleProgram::TimePlayer;
  }
  ImGui::SameLine();
  if (ImGui::Button("Reset 2022")) {
    app.timePlayer.currentYear = kInitialYear;
    app.visibleProgram = VisibleProgram::TimePlayer;
  }

  syncTimePlayerSpeed(app.timePlayer);
  const std::string currentYear = formatDecimalYear(app.timePlayer.currentYear);
  const std::string currentRate = formatTimeRate(app.timePlayer.speedSecondsPerSecond);
  const std::string sampledRate = formatYearRate(app.timePlayer.sampledYearsPerSecond);
  ImGui::Text("Current: %s | sampled %s", currentYear.c_str(), sampledRate.c_str());
  ImGui::Text("Target rate: %s", currentRate.c_str());
  ImGui::Text("Visible sky: %s", visibleProgramName(app.visibleProgram));
  if (app.timePlayer.playing) {
    ImGui::Text("Decimal year: %.6f", app.timePlayer.currentYear);
  } else {
    ImGui::InputDouble("Set decimal year", &app.timePlayer.currentYear, 1.0, 100.0, "%.6f");
    sanitizeTimePlayer(app.timePlayer);
  }

  ImGui::Separator();
  ImGui::Text("Custom rate per real second");
  bool customChanged = false;
  customChanged |= ImGui::InputDouble("Years", &app.timePlayer.customYearsPerSecond, 0.1, 1.0, "%.3f");
  customChanged |= ImGui::InputDouble("Days", &app.timePlayer.customDaysPerSecond, 1.0, 10.0, "%.3f");
  customChanged |= ImGui::InputDouble("Hours", &app.timePlayer.customHoursPerSecond, 1.0, 10.0, "%.3f");
  customChanged |= ImGui::InputDouble("Minutes", &app.timePlayer.customMinutesPerSecond, 1.0, 10.0, "%.3f");
  customChanged |= ImGui::InputDouble("Seconds", &app.timePlayer.customSecondsPerSecond, 1.0, 10.0, "%.3f");
  if (customChanged) {
    syncTimePlayerSpeed(app.timePlayer);
  }
  const double customRate = customTimePlayerRateSeconds(app.timePlayer);
  const std::string customRateLabel = formatTimeRate(customRate);
  const std::string customMagnitude = customRateLabel.size() > 2 ? customRateLabel.substr(2) : customRateLabel;
  ImGui::Text("Custom magnitude: %s", customMagnitude.c_str());
  if (ImGui::Button("Apply backward", ImVec2(112.0f, 0.0f))) {
    setTimePlayerDirection(app, -1.0);
  }
  ImGui::SameLine();
  if (ImGui::Button("Apply forward", ImVec2(112.0f, 0.0f))) {
    setTimePlayerDirection(app, 1.0);
  }
  if (ImGui::Button("Stop rate", ImVec2(229.0f, 0.0f))) {
    setTimePlayerDirection(app, 0.0);
    app.timePlayer.playing = false;
  }

  ImGui::Separator();
  ImGui::Text("Shared observer");
  if (ImGui::SliderFloat("Latitude##time-player", &app.gui.latitudeDegrees, -90.0f, 90.0f, "%.4f") ||
      ImGui::SliderFloat("Longitude##time-player", &app.gui.longitudeDegrees, -180.0f, 180.0f, "%.4f")) {
    applyGuiSettings(app);
  }
  drawProjectionControls(app, "time-player-projection");
  drawSolarSystemControls(app, "time-player-solar-system");
  drawMoonCameraControls(app, "time-player-moon-camera");
  drawHdrControls(app, "time-player-hdr");
  ImGui::TextDisabled("F1 toggles the old window. This window stays separate.");
  ImGui::End();
}

void drawControls(AppState& app, double fps, std::size_t starCount) {
  if (!app.gui.showControls) {
    return;
  }

  ImGui::SetNextWindowSize(ImVec2(390.0f, 0.0f), ImGuiCond_FirstUseEver);
  ImGui::Begin("Sky Rewind Controls", &app.gui.showControls);
  drawMoonIcon(34.0f);
  ImGui::SameLine();
  ImGui::BeginGroup();
  ImGui::Text("Native C++ / OpenGL");
  ImGui::Text("%.0f FPS | %zu Hipparcos stars", fps, starCount);
  ImGui::EndGroup();
  ImGui::Separator();

  ImGui::Text("Transport");
  ImGui::TextDisabled("Cairo reference preset: 2022 CE -> near 1 BCE.");
  if (ImGui::Button(app.animation.paused || !app.animation.active ? "Play" : "Pause")) {
    const double now = glfwGetTime();
    if (!app.animation.active) {
      app.visibleProgram = VisibleProgram::CinematicRewind;
      restartAnimation(app, now);
    } else if (app.animation.paused) {
      app.visibleProgram = VisibleProgram::CinematicRewind;
      app.animation.pausedDuration += now - app.animation.pausedAt;
      app.animation.paused = false;
    } else {
      app.animation.pausedAt = now;
      app.animation.paused = true;
    }
  }
  ImGui::SameLine();
  if (ImGui::Button("Restart")) {
    app.visibleProgram = VisibleProgram::CinematicRewind;
    restartAnimation(app, glfwGetTime());
  }
  ImGui::SameLine();
  if (ImGui::Button("Use visible sky")) {
    app.visibleProgram = VisibleProgram::CinematicRewind;
  }
  ImGui::Text("Current year: %.2f", app.animation.currentYear);
  ImGui::Text("Visible sky: %s", visibleProgramName(app.visibleProgram));

  ImGui::Separator();
  bool restartRecommended = false;
  restartRecommended |= ImGui::SliderFloat("Start year", &app.gui.startYear, -10000.0f, 10000.0f, "%.1f");
  restartRecommended |= ImGui::SliderFloat("Rewind years", &app.gui.rewindYears, 1.0f, 10000.0f, "%.0f");
  restartRecommended |= ImGui::SliderFloat("Duration sec", &app.gui.durationSeconds, 1.0f, 60.0f, "%.1f");

  ImGui::Text("Acceleration curve");
  bool curveChanged = false;
  curveChanged |= ImGui::SliderFloat("Inertia hold", &app.gui.inertiaPortion, 0.0f, 0.65f, "%.2f");
  curveChanged |= ImGui::SliderFloat("Drift percent", &app.gui.driftPercent, 0.0f, 2.0f, "%.4f");
  curveChanged |= ImGui::SliderFloat("Power", &app.gui.power, 1.0f, 6.0f, "%.1f");
  drawCurvePreview(app);
  if (curveChanged || restartRecommended) {
    applyGuiSettings(app);
  }
  if (restartRecommended) {
    ImGui::TextColored(ImVec4(1.0f, 0.82f, 0.38f, 1.0f), "Restart to apply transport range changes.");
  }

  ImGui::Separator();
  ImGui::Text("Observer");
  if (ImGui::SliderFloat("Latitude", &app.gui.latitudeDegrees, -90.0f, 90.0f, "%.4f") ||
      ImGui::SliderFloat("Longitude", &app.gui.longitudeDegrees, -180.0f, 180.0f, "%.4f")) {
    applyGuiSettings(app);
  }

  ImGui::Separator();
  ImGui::Text("Rendering");
  if (ImGui::SliderFloat("Faint mag limit", &app.gui.faintMagnitudeLimit, 4.0f, 12.5f, "%.1f")) {
    app.gui.faintMagnitudeLimit = std::max(app.gui.faintMagnitudeLimit, app.gui.brightMagnitudeLimit + 0.1f);
  }
  if (ImGui::SliderFloat("Fast bright limit", &app.gui.brightMagnitudeLimit, -1.5f, 8.0f, "%.1f")) {
    app.gui.brightMagnitudeLimit = std::min(app.gui.brightMagnitudeLimit, app.gui.faintMagnitudeLimit - 0.1f);
  }
  ImGui::SliderFloat("Star size", &app.gui.starSizeScale, 0.25f, 3.0f, "%.2f");
  ImGui::Checkbox("Long exposure", &app.gui.longExposure);
  int streakStyle = static_cast<int>(app.gui.streakStyle);
  if (ImGui::Combo(
        "Streak style",
        &streakStyle,
        "Smooth exposure\0Solid light trail\0Shutter samples\0Legacy full-star lines\0"
      )) {
    app.gui.streakStyle = static_cast<StreakStyle>(streakStyle);
  }
  if (app.gui.streakStyle == StreakStyle::LegacyFullStarLines) {
    ImGui::SliderFloat(
      "Legacy streak length",
      &app.gui.legacyStreakLengthYears,
      0.03f,
      1.2f,
      "%.2f sky yr"
    );
    ImGui::SliderFloat(
      "Legacy streak width",
      &app.gui.legacyStreakWidthPixels,
      0.8f,
      8.0f,
      "%.1f px"
    );
  }
  ImGui::SliderFloat("Shutter duration", &app.gui.shutterDurationSeconds, 0.05f, 3.0f, "%.2f sec");
  ImGui::SliderFloat(
    "Motion threshold",
    &app.gui.exposureMotionThresholdPixels,
    0.05f,
    12.0f,
    "%.2f px/frame",
    ImGuiSliderFlags_Logarithmic
  );
  ImGui::SliderFloat("Trail strength", &app.gui.exposureStrength, 0.0f, 1.0f, "%.2f");
  ImGui::SliderFloat(
    "Curve segment length",
    &app.gui.exposureSampleSpacingPixels,
    24.0f,
    160.0f,
    "%.1f px"
  );
  ImGui::TextDisabled("Shorter curve segments use more GPU time.");
  ImGui::Text(
    "Apparent motion: %.2f px/frame | %d segment%s | %zu trail stars%s",
    app.exposureMotionPixels,
    app.exposureSampleCount,
    app.exposureSampleCount == 1 ? "" : "s",
    app.exposureTrailStarCount,
    app.exposureActive ? " | exposing" : ""
  );
  ImGui::BeginDisabled(app.gui.longExposure);
  ImGui::Checkbox("Zoetrope sampling", &app.gui.zoetropeSampling);
  ImGui::SliderFloat("Zoetrope interval", &app.gui.zoetropeIntervalYears, 120.0f, 1400.0f, "%.0f yr");
  ImGui::SliderFloat("Zoetrope blend", &app.gui.zoetropeBlendPortion, 0.04f, 0.65f, "%.2f");
  ImGui::EndDisabled();
  if (app.gui.longExposure) {
    ImGui::TextDisabled("Continuous exposure replaces zoetrope sampling.");
  }
  ImGui::Checkbox("Three sky layers", &app.gui.layeredSky);
  ImGui::SliderFloat("Layer separation", &app.gui.layerSeparation, 0.0f, 1.0f, "%.2f");
  ImGui::SliderFloat("Atmosphere warp", &app.gui.atmosphereWarp, 0.0f, 1.0f, "%.2f");
  if (ImGui::Checkbox("Moon element", &app.gui.showMoon) && !app.gui.showMoon) {
    app.gui.moonTrackingMode = MoonTrackingMode::Off;
  }
  drawMoonCameraControls(app, "cinematic-moon-camera");
  ImGui::SliderFloat("Moon size", &app.gui.moonSizePixels, 24.0f, 160.0f, "%.0f px");
  drawSolarSystemControls(app, "cinematic-solar-system");
  ImGui::Checkbox("Horizon guide", &app.gui.showHorizon);
  ImGui::SliderFloat("Horizon opacity", &app.gui.horizonAlpha, 0.1f, 1.0f, "%.2f");
  drawProjectionControls(app, "cinematic-projection");
  drawHdrControls(app, "cinematic-hdr");
  if (ImGui::Checkbox("VSync", &app.gui.vsync)) {
    glfwSwapInterval(app.gui.vsync ? 1 : 0);
  }
  ImGui::TextDisabled("F1 hides/shows this panel.");
  ImGui::End();
}

void drawCinematicOverlays(float cinematicStrength, const ZoetropeState& zoetrope) {
  ImDrawList* drawList = ImGui::GetBackgroundDrawList();
  const ImVec2 screen = ImGui::GetIO().DisplaySize;
  const int tintAlpha = static_cast<int>(std::clamp(cinematicStrength * 30.0f + zoetrope.lockPulse * 16.0f, 0.0f, 46.0f));
  if (tintAlpha > 0) {
    drawList->AddRectFilled(ImVec2(0.0f, 0.0f), screen, IM_COL32(12, 34, 68, tintAlpha));
  }
}

std::string makeTitle(double fps, VisibleProgram program, double visibleYear, std::size_t starCount) {
  std::ostringstream title;
  const std::string yearLabel = formatDecimalYear(visibleYear);
  title << "Sky Rewind C++ | "
        << std::fixed << std::setprecision(0) << fps << " FPS | "
        << yearLabel << " | "
        << visibleProgramName(program) << " | "
        << starCount << " Hipparcos stars | Space old play | F2 time player";
  return title.str();
}

void configureOpenGLWindowHints(bool floatingPointColor, bool visible) {
  glfwDefaultWindowHints();
  glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
  glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 1);
  glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
  glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GLFW_TRUE);
  glfwWindowHint(GLFW_SAMPLES, 0);
  glfwWindowHint(GLFW_VISIBLE, visible ? GLFW_TRUE : GLFW_FALSE);
#ifdef __APPLE__
  if (floatingPointColor) {
    glfwWindowHint(GLFW_RED_BITS, 16);
    glfwWindowHint(GLFW_GREEN_BITS, 16);
    glfwWindowHint(GLFW_BLUE_BITS, 16);
    glfwWindowHint(GLFW_ALPHA_BITS, 16);
  }
#else
  (void) floatingPointColor;
#endif
}

GLFWwindow* createOpenGLWindow(int width, int height, const char* title, bool visible) {
  configureOpenGLWindowHints(true, visible);
  GLFWwindow* window = glfwCreateWindow(width, height, title, nullptr, nullptr);
#ifdef __APPLE__
  if (window == nullptr) {
    configureOpenGLWindowHints(false, visible);
    window = glfwCreateWindow(width, height, title, nullptr, nullptr);
  }
#endif
  return window;
}

int checkShaderPrograms() {
  if (!glfwInit()) {
    throw std::runtime_error("Unable to initialize GLFW for shader check.");
  }

  GLFWwindow* window = createOpenGLWindow(64, 64, "Sky Rewind Shader Check", false);
  if (!window) {
    glfwTerminate();
    throw std::runtime_error("Unable to create hidden OpenGL window for shader check.");
  }

  glfwMakeContextCurrent(window);
  const ExtendedRangeState extendedRange = configureExtendedRange(window);
  const GlProgram starsProgram = makeProgram(starVertexShader(), starFragmentShader());
  const GlProgram starTrailsProgram = makeProgram(
    starTrailVertexShader(),
    starTrailFragmentShader(),
    starTrailGeometryShader()
  );
  const GlProgram moonProgram =
    makeProgram(skyBodyVertexShader(), moonFragmentShader(), skyBodyGeometryShader());
  const GlProgram solarSystemProgram =
    makeProgram(skyBodyVertexShader(), celestialBodyFragmentShader(), skyBodyGeometryShader());
  const GlProgram exposureProgram = makeProgram(longExposureVertexShader(), longExposureFragmentShader());
  const GlProgram displayProgram =
    makeProgram(longExposureVertexShader(), longExposureDisplayFragmentShader());
  const GlProgram guideProgram = makeProgram(guideVertexShader(), guideFragmentShader());
  glDeleteProgram(guideProgram.id);
  glDeleteProgram(displayProgram.id);
  glDeleteProgram(exposureProgram.id);
  glDeleteProgram(solarSystemProgram.id);
  glDeleteProgram(moonProgram.id);
  glDeleteProgram(starTrailsProgram.id);
  glDeleteProgram(starsProgram.id);
  glfwDestroyWindow(window);
  glfwTerminate();
  std::cout
    << "OpenGL shader check passed. Default framebuffer: "
    << (extendedRange.floatingPointSurface ? "FP16" : "integer SDR")
    << ", display potential: "
    << std::fixed << std::setprecision(2)
    << extendedRange.potentialHeadroom << "x.\n";
  return EXIT_SUCCESS;
}

int runWindow(const std::vector<StarVertex>& stars) {
  if (!glfwInit()) {
    throw std::runtime_error("Unable to initialize GLFW.");
  }

  GLFWwindow* window = createOpenGLWindow(1440, 960, "Sky Rewind C++", true);
  if (!window) {
    glfwTerminate();
    throw std::runtime_error("Unable to create native OpenGL window.");
  }
  setMoonWindowIcon(window);

  AppState app;
  applyGuiSettings(app);
  glfwSetWindowUserPointer(window, &app);
  glfwSetKeyCallback(window, keyCallback);
  glfwSetCursorPosCallback(window, cursorCallback);
  glfwSetMouseButtonCallback(window, mouseButtonCallback);
  glfwSetScrollCallback(window, scrollCallback);
  glfwSetCharCallback(window, charCallback);
  glfwSetFramebufferSizeCallback(window, framebufferSizeCallback);
  glfwMakeContextCurrent(window);
  app.extendedRange = configureExtendedRange(window);
  glfwSwapInterval(1);
  glfwGetFramebufferSize(window, &app.framebufferWidth, &app.framebufferHeight);
  glViewport(0, 0, app.framebufferWidth, app.framebufferHeight);

  glEnable(GL_PROGRAM_POINT_SIZE);
  glEnable(GL_CLIP_DISTANCE0);
  glEnable(GL_BLEND);
  glBlendFunc(GL_SRC_ALPHA, GL_ONE);

  IMGUI_CHECKVERSION();
  ImGui::CreateContext();
  ImGui::GetIO().ConfigFlags |= ImGuiConfigFlags_NavEnableKeyboard;
  ImGui::StyleColorsDark();
  ImGui_ImplGlfw_InitForOpenGL(window, false);
  ImGui_ImplOpenGL3_Init("#version 410");

  const GlProgram starsProgram = makeProgram(starVertexShader(), starFragmentShader());
  const GlProgram starTrailsProgram = makeProgram(
    starTrailVertexShader(),
    starTrailFragmentShader(),
    starTrailGeometryShader()
  );
  const GlProgram moonProgram =
    makeProgram(skyBodyVertexShader(), moonFragmentShader(), skyBodyGeometryShader());
  const GlProgram solarSystemProgram =
    makeProgram(skyBodyVertexShader(), celestialBodyFragmentShader(), skyBodyGeometryShader());
  const GlProgram exposureProgram = makeProgram(longExposureVertexShader(), longExposureFragmentShader());
  const GlProgram displayProgram =
    makeProgram(longExposureVertexShader(), longExposureDisplayFragmentShader());
  const GlProgram guideProgram = makeProgram(guideVertexShader(), guideFragmentShader());
  LongExposureBuffer exposureBuffer;
  GLuint vao = 0;
  GLuint vbo = 0;
  GLuint moonVao = 0;
  GLuint guideVao = 0;
  GLuint guideVbo = 0;
  std::vector<StarVertex> renderStars = stars;
  std::stable_sort(
    renderStars.begin(),
    renderStars.end(),
    [](const StarVertex& a, const StarVertex& b) {
      return a.magnitude < b.magnitude;
    }
  );
  const auto starCountForMagnitude = [&](float maximumMagnitude) {
    return static_cast<std::size_t>(std::distance(
      renderStars.begin(),
      std::upper_bound(
        renderStars.begin(),
        renderStars.end(),
        maximumMagnitude,
        [](float magnitude, const StarVertex& star) {
          return magnitude < star.magnitude;
        }
      )
    ));
  };
  const std::vector<GuideVertex> guideVertices = makeHorizonGuideVertices();
  glGenVertexArrays(1, &vao);
  glGenBuffers(1, &vbo);
  glGenVertexArrays(1, &moonVao);
  glGenVertexArrays(1, &guideVao);
  glGenBuffers(1, &guideVbo);
  uploadStarAttributes(vao, vbo, renderStars);
  uploadGuideAttributes(guideVao, guideVbo, guideVertices);

  double lastFrameTime = glfwGetTime();
  double lastTitleTime = lastFrameTime;
  double smoothedFps = 0.0;
  ProjectionUniforms previousExposureProjection;
  double previousExposureYear = kInitialYear;
  VisibleProgram previousExposureProgram = app.visibleProgram;
  float previousCameraYaw = app.camera.yaw;
  float previousCameraPitch = app.camera.pitch;
  float previousRenderFov = 0.0f;
  float previousRenderAspect = 0.0f;
  MoonTrackingMode previousMoonTrackingMode = app.gui.moonTrackingMode;
  ProjectionMode previousProjectionMode = app.gui.projectionMode;
  StreakStyle previousStreakStyle = app.gui.streakStyle;
  float previousLegacyStreakLength = app.gui.legacyStreakLengthYears;
  float previousLegacyStreakWidth = app.gui.legacyStreakWidthPixels;
  bool previousExposureProjectionValid = false;

  while (!glfwWindowShouldClose(window)) {
    glfwPollEvents();
    const double now = glfwGetTime();
    const double delta = std::max(0.001, now - lastFrameTime);
    lastFrameTime = now;
    const double instantFps = 1.0 / delta;
    smoothedFps = smoothedFps == 0.0 ? instantFps : smoothedFps * 0.9 + instantFps * 0.1;
    app.extendedRange = queryExtendedRange(
      window,
      app.extendedRange.floatingPointSurface
    );

    applyGuiSettings(app);
    updateAnimation(app.animation, now, delta);
    updateTimePlayer(app.timePlayer, delta);

    ImGui_ImplOpenGL3_NewFrame();
    ImGui_ImplGlfw_NewFrame();
    ImGui::NewFrame();
    drawControls(app, smoothedFps, stars.size());
    drawTimePlayerControls(app);

    applyGuiSettings(app);
    const bool usingTimePlayer = app.visibleProgram == VisibleProgram::TimePlayer;
    const ZoetropeState zoetrope = makeZoetropeState(app);
    const double visibleYear = usingTimePlayer ? app.timePlayer.currentYear : zoetrope.primaryYear;
    const ProjectionUniforms projection = projectionForLayer(visibleYear, app.location, 0.0f, 0.0f);
    const float cinematicStrength = usingTimePlayer ? 0.0f : static_cast<float>(app.animation.motionStrength);
    const float hdrHighlightScale = app.gui.hdrOutput ? 3.0f : 0.0f;
    const bool trackingMoon =
      app.gui.showMoon && app.gui.moonTrackingMode != MoonTrackingMode::Off;
    if (trackingMoon) {
      orientCameraTowardMoon(app, visibleYear);
    }
    const float maxVisibleMagnitude = maxMagnitudeForSpeed(
      cinematicStrength,
      app.gui.faintMagnitudeLimit,
      app.gui.brightMagnitudeLimit
    );
    const float viewportAspect =
      static_cast<float>(app.framebufferWidth) /
      static_cast<float>(std::max(1, app.framebufferHeight));
    const ViewProjection viewProjection = makeViewProjection(
      app.gui.projectionMode,
      app.camera.fovRadians,
      viewportAspect,
      app.gui.physicalDisplay
    );
    const float renderFov = viewProjection.verticalFovRadians;
    const float aspect = viewProjection.perspectiveAspect;
    const float fisheyeBlend = viewProjection.fisheyeBlend;
    const Mat4 projectionMatrix = perspective(renderFov, aspect, 0.1f, 500.0f);
    const Vec3 direction = {
      std::cos(app.camera.pitch) * std::sin(app.camera.yaw),
      std::sin(app.camera.pitch),
      -std::cos(app.camera.pitch) * std::cos(app.camera.yaw),
    };
    const float hemisphere = app.location.latitudeRadians < 0.0 ? -1.0f : 1.0f;
    const Vec3 cameraUp = app.gui.moonTrackingMode == MoonTrackingMode::SkyStabilized
      ? Vec3{
          0.0f,
          std::abs(static_cast<float>(std::sin(app.location.latitudeRadians))),
          -hemisphere * static_cast<float>(std::cos(app.location.latitudeRadians)),
        }
      : Vec3{0.0f, 1.0f, 0.0f};
    const Mat4 viewMatrix = lookAt({0.0f, 0.0f, 0.0f}, direction, cameraUp);
    const float effectClock = static_cast<float>(now + (app.animation.startYear - visibleYear) * 0.013);
    const bool exposureResized = resizeLongExposureBuffer(
      exposureBuffer,
      app.framebufferWidth,
      app.framebufferHeight
    );
    const bool simulationMoving = usingTimePlayer
      ? app.timePlayer.playing && std::abs(app.timePlayer.sampledYearsPerSecond) > 0.0
      : app.animation.active && !app.animation.paused;
    const bool programChanged =
      previousExposureProjectionValid && previousExposureProgram != app.visibleProgram;
    const bool trackingModeChanged =
      previousMoonTrackingMode != app.gui.moonTrackingMode;
    const bool projectionModeChanged =
      previousProjectionMode != app.gui.projectionMode;
    const bool streakStyleChanged =
      previousStreakStyle != app.gui.streakStyle;
    const bool legacyStreakChanged =
      app.gui.streakStyle == StreakStyle::LegacyFullStarLines &&
      (
        std::abs(
          previousLegacyStreakLength -
          app.gui.legacyStreakLengthYears
        ) > 0.00001f ||
        std::abs(
          previousLegacyStreakWidth -
          app.gui.legacyStreakWidthPixels
        ) > 0.00001f
      );
    const bool cameraOrientationChanged =
      std::abs(app.camera.yaw - previousCameraYaw) > 0.00001f ||
      std::abs(app.camera.pitch - previousCameraPitch) > 0.00001f;
    const bool projectionShapeChanged =
      std::abs(renderFov - previousRenderFov) > 0.00001f ||
      std::abs(aspect - previousRenderAspect) > 0.00001f;
    const bool cameraChanged =
      trackingModeChanged ||
      projectionModeChanged ||
      projectionShapeChanged ||
      (!trackingMoon && cameraOrientationChanged);
    app.exposureMotionPixels = previousExposureProjectionValid && !programChanged
      ? estimateApparentMotionPixels(
          projection,
          previousExposureProjection,
          visibleYear,
          previousExposureYear,
          renderFov,
          app.framebufferHeight,
          fisheyeBlend
        )
      : 0.0f;
    const float trailMotionStrength = static_cast<float>(smoothStep01(
      (app.exposureMotionPixels - 24.0f) / 360.0f
    ));
    const float trailVisibleMagnitude = maxMagnitudeForSpeed(
      std::max(cinematicStrength, trailMotionStrength),
      app.gui.faintMagnitudeLimit,
      app.gui.brightMagnitudeLimit
    );
    app.exposureTrailStarCount =
      starCountForMagnitude(trailVisibleMagnitude);
    const float motionThreshold = std::max(0.01f, app.gui.exposureMotionThresholdPixels);
    const float activationRange = std::max(0.01f, motionThreshold * 2.0f);
    const float motionActivation = static_cast<float>(smoothStep01(
      (app.exposureMotionPixels - motionThreshold) / activationRange
    ));
    app.exposureActive =
      app.gui.longExposure &&
      simulationMoving &&
      !app.camera.dragging &&
      !cameraChanged &&
      motionActivation > 0.0f;
    const float retention = std::exp(
      std::log(0.01f) *
      static_cast<float>(delta) /
      std::max(0.01f, app.gui.shutterDurationSeconds)
    );
    const float exposureStrength = app.exposureActive
      ? motionActivation * app.gui.exposureStrength
      : 0.0f;
    const bool resetExposureHistory =
      exposureResized ||
      !previousExposureProjectionValid ||
      programChanged ||
      cameraChanged ||
      streakStyleChanged ||
      legacyStreakChanged ||
      app.camera.dragging ||
      !app.gui.longExposure ||
      !simulationMoving;
    const bool interpolateExposure =
      app.exposureActive &&
      !resetExposureHistory &&
      previousExposureProjectionValid;
    app.exposureSampleCount = interpolateExposure
      ? std::clamp(
          static_cast<int>(std::ceil(
            app.exposureMotionPixels /
            std::max(1.0f, app.gui.exposureSampleSpacingPixels)
          )),
          1,
          kMaxExposureSamples
        )
      : 1;
    if (app.gui.streakStyle == StreakStyle::LegacyFullStarLines) {
      app.exposureSampleCount = 1;
      app.exposureTrailStarCount =
        starCountForMagnitude(maxVisibleMagnitude);
    }
    const double exposureStartYear = previousExposureYear;

    previousExposureProjection = projection;
    previousExposureYear = visibleYear;
    previousExposureProgram = app.visibleProgram;
    previousCameraYaw = app.camera.yaw;
    previousCameraPitch = app.camera.pitch;
    previousRenderFov = renderFov;
    previousRenderAspect = aspect;
    previousMoonTrackingMode = app.gui.moonTrackingMode;
    previousProjectionMode = app.gui.projectionMode;
    previousStreakStyle = app.gui.streakStyle;
    previousLegacyStreakLength = app.gui.legacyStreakLengthYears;
    previousLegacyStreakWidth = app.gui.legacyStreakWidthPixels;
    previousExposureProjectionValid = true;

    const auto drawSkyState = [&](double year, float alphaScale, float phaseOffset) {
      const float cinematicLayer = cinematicStrength * app.gui.layerSeparation;
      const float warp = app.gui.atmosphereWarp * (0.35f + cinematicStrength * 0.95f);
      const ProjectionUniforms mainProjection = projectionForLayer(year, app.location, 0.0f, 0.0f);
      drawStarPass(
        starsProgram,
        vao,
        starCountForMagnitude(maxVisibleMagnitude),
        viewMatrix,
        projectionMatrix,
        mainProjection,
        maxVisibleMagnitude,
        cinematicStrength,
        hdrHighlightScale,
        app.gui.starSizeScale,
        alphaScale,
        0.04f,
        warp,
        effectClock + phaseOffset,
        renderFov,
        aspect,
        fisheyeBlend
      );

      if (!app.gui.layeredSky || cinematicLayer <= 0.001f) {
        return;
      }

      const ProjectionUniforms diurnalProjection = projectionForLayer(
        year + static_cast<double>(cinematicLayer) * 3.4,
        app.location,
        cinematicLayer * (0.54f + std::sin(effectClock * 0.29f + phaseOffset) * 0.08f),
        cinematicLayer * 0.012f
      );
      drawStarPass(
        starsProgram,
        vao,
        starCountForMagnitude(maxVisibleMagnitude - 0.25f),
        viewMatrix,
        projectionMatrix,
        diurnalProjection,
        maxVisibleMagnitude - 0.25f,
        cinematicStrength,
        hdrHighlightScale,
        app.gui.starSizeScale * 1.18f,
        alphaScale * cinematicStrength * 0.32f,
        0.22f,
        warp * 1.3f,
        effectClock * 1.17f + phaseOffset,
        renderFov,
        aspect,
        fisheyeBlend
      );

      const ProjectionUniforms driftProjection = projectionForLayer(
        year - static_cast<double>(cinematicLayer) * 5.8,
        app.location,
        cinematicLayer * (-0.38f + std::cos(effectClock * 0.21f + phaseOffset) * 0.07f),
        -cinematicLayer * 0.018f
      );
      drawStarPass(
        starsProgram,
        vao,
        starCountForMagnitude(maxVisibleMagnitude - 0.65f),
        viewMatrix,
        projectionMatrix,
        driftProjection,
        maxVisibleMagnitude - 0.65f,
        cinematicStrength,
        hdrHighlightScale,
        app.gui.starSizeScale * 1.42f,
        alphaScale * cinematicStrength * 0.22f,
        0.34f,
        warp * 1.55f,
        effectClock * 0.83f + phaseOffset,
        renderFov,
        aspect,
        fisheyeBlend
      );
    };

    beginLongExposureTrails(exposureBuffer);
    if (interpolateExposure) {
      double exposureYearSpan = visibleYear - exposureStartYear;
      const double maximumUsefulSpan = kTau / kSiderealRadiansPerYear;
      if (std::abs(exposureYearSpan) > maximumUsefulSpan) {
        exposureYearSpan = std::copysign(maximumUsefulSpan, exposureYearSpan);
      }
      const double sampledStartYear = visibleYear - exposureYearSpan;
      if (app.gui.streakStyle == StreakStyle::ShutterSamples) {
        glBlendEquation(GL_FUNC_ADD);
        const float sampleAlpha = std::clamp(
          exposureStrength * 0.8f /
            std::sqrt(static_cast<float>(app.exposureSampleCount)),
          0.04f,
          0.35f
        );
        for (int sample = 0; sample < app.exposureSampleCount; ++sample) {
          const double t =
            static_cast<double>(sample) /
            static_cast<double>(app.exposureSampleCount);
          const double sampleYear =
            sampledStartYear + exposureYearSpan * t;
          const ProjectionUniforms sampleProjection =
            projectionForLayer(sampleYear, app.location, 0.0f, 0.0f);
          drawStarPass(
            starsProgram,
            vao,
            app.exposureTrailStarCount,
            viewMatrix,
            projectionMatrix,
            sampleProjection,
            trailVisibleMagnitude,
            cinematicStrength,
            hdrHighlightScale,
            app.gui.starSizeScale,
            sampleAlpha,
            0.0f,
            0.0f,
            effectClock,
            renderFov,
            aspect,
            fisheyeBlend
          );
        }
      } else {
        glBlendEquation(GL_MAX);
        const bool legacyLines =
          app.gui.streakStyle == StreakStyle::LegacyFullStarLines;
        const int segmentCount =
          legacyLines ? 1 : app.exposureSampleCount;
        const double trailStartYear = legacyLines
          ? visibleYear - std::copysign(
              static_cast<double>(app.gui.legacyStreakLengthYears),
              exposureYearSpan
            )
          : sampledStartYear;
        ProjectionUniforms segmentStartProjection =
          projectionForLayer(trailStartYear, app.location, 0.0f, 0.0f);
        for (int sample = 1; sample <= segmentCount; ++sample) {
          const double t =
            static_cast<double>(sample) /
            static_cast<double>(segmentCount);
          const double segmentEndYear =
            trailStartYear + (visibleYear - trailStartYear) * t;
          const ProjectionUniforms segmentEndProjection =
            projectionForLayer(segmentEndYear, app.location, 0.0f, 0.0f);
          const float streakMagnitude = legacyLines
            ? maxVisibleMagnitude
            : trailVisibleMagnitude;
          const std::size_t streakStarCount = legacyLines
            ? starCountForMagnitude(maxVisibleMagnitude)
            : app.exposureTrailStarCount;
          drawStarTrailPass(
            starTrailsProgram,
            vao,
            streakStarCount,
            viewMatrix,
            projectionMatrix,
            segmentStartProjection,
            segmentEndProjection,
            streakMagnitude,
            cinematicStrength,
            hdrHighlightScale,
            app.gui.starSizeScale,
            exposureStrength,
            static_cast<float>(sample - 1) /
              static_cast<float>(segmentCount),
            static_cast<float>(sample) /
              static_cast<float>(segmentCount),
            !legacyLines,
            !legacyLines,
            app.gui.streakStyle,
            legacyLines ? app.gui.legacyStreakWidthPixels : 0.0f,
            app.framebufferWidth,
            app.framebufferHeight,
            renderFov,
            aspect,
            fisheyeBlend
          );
          segmentStartProjection = segmentEndProjection;
        }
      }
    }
    glBlendEquation(GL_FUNC_ADD);

    beginLongExposureScene(exposureBuffer);
    if (usingTimePlayer) {
      drawStarPass(
        starsProgram,
        vao,
        starCountForMagnitude(app.gui.faintMagnitudeLimit),
        viewMatrix,
        projectionMatrix,
        projection,
        app.gui.faintMagnitudeLimit,
        0.0f,
        hdrHighlightScale,
        app.gui.starSizeScale,
        1.0f,
        0.0f,
        0.0f,
        effectClock,
        renderFov,
        aspect,
        fisheyeBlend
      );
    } else {
      drawSkyState(zoetrope.primaryYear, 0.9f * (1.0f - zoetrope.secondaryAlpha * 0.42f), 0.0f);
      if (zoetrope.secondaryAlpha > 0.01f) {
        drawSkyState(zoetrope.secondaryYear, 0.78f * zoetrope.secondaryAlpha, 3.7f);
      }
    }

    drawSolarSystemPass(
      solarSystemProgram,
      moonVao,
      viewMatrix,
      projectionMatrix,
      visibleYear,
      app.location,
      app.framebufferWidth,
      app.framebufferHeight,
      renderFov,
      aspect,
      fisheyeBlend,
      app.gui.solarSystemSizeScale,
      1.0f,
      app.gui.showSun,
      app.gui.showPlanets,
      app.gui.hdrOutput
    );

    if (app.gui.showHorizon) {
      glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      glLineWidth(2.5f);
      glUseProgram(guideProgram.id);
      glUniformMatrix4fv(glGetUniformLocation(guideProgram.id, "uView"), 1, GL_FALSE, viewMatrix.m.data());
      glUniformMatrix4fv(glGetUniformLocation(guideProgram.id, "uProjection"), 1, GL_FALSE, projectionMatrix.m.data());
      glUniform1f(glGetUniformLocation(guideProgram.id, "uAlphaScale"), app.gui.horizonAlpha);
      glUniform1f(
        glGetUniformLocation(guideProgram.id, "uFovRadians"),
        renderFov
      );
      glUniform1f(glGetUniformLocation(guideProgram.id, "uAspect"), aspect);
      glUniform1f(
        glGetUniformLocation(guideProgram.id, "uFisheyeBlend"),
        fisheyeBlend
      );
      glBindVertexArray(guideVao);
      glDrawArrays(GL_LINES, 0, static_cast<GLsizei>(guideVertices.size()));
      glBlendFunc(GL_SRC_ALPHA, GL_ONE);
    }

    resolveLongExposure(
      exposureBuffer,
      exposureProgram.id,
      displayProgram.id,
      retention,
      resetExposureHistory,
      hdrOutputMode(app),
      app.gui.hdrExposure,
      app.extendedRange.currentHeadroom
    );

    if (app.gui.showMoon) {
      drawMoonPass(
        moonProgram,
        moonVao,
        viewMatrix,
        projectionMatrix,
        visibleYear,
        app.location,
        app.framebufferWidth,
        app.framebufferHeight,
        renderFov,
        aspect,
        fisheyeBlend,
        app.gui.moonSizePixels,
        1.0f
      );
    }

    if (!usingTimePlayer) {
      drawCinematicOverlays(cinematicStrength, zoetrope);
    }

    ImGui::Render();
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
    glBlendFunc(GL_SRC_ALPHA, GL_ONE);

    if (now - lastTitleTime > 0.25) {
      glfwSetWindowTitle(window, makeTitle(smoothedFps, app.visibleProgram, visibleYear, stars.size()).c_str());
      lastTitleTime = now;
    }

    glfwSwapBuffers(window);
  }

  ImGui_ImplOpenGL3_Shutdown();
  ImGui_ImplGlfw_Shutdown();
  ImGui::DestroyContext();
  glDeleteBuffers(1, &guideVbo);
  glDeleteVertexArrays(1, &guideVao);
  glDeleteVertexArrays(1, &moonVao);
  glDeleteBuffers(1, &vbo);
  glDeleteVertexArrays(1, &vao);
  destroyLongExposureBuffer(exposureBuffer);
  glDeleteProgram(guideProgram.id);
  glDeleteProgram(displayProgram.id);
  glDeleteProgram(exposureProgram.id);
  glDeleteProgram(solarSystemProgram.id);
  glDeleteProgram(moonProgram.id);
  glDeleteProgram(starTrailsProgram.id);
  glDeleteProgram(starsProgram.id);
  glfwDestroyWindow(window);
  glfwTerminate();
  return EXIT_SUCCESS;
}

} // namespace
} // namespace skyrewind

int main(int argc, char** argv) {
  try {
    const bool checkOnly = argc > 1 && std::string(argv[1]) == "--check";
    const bool shaderCheckOnly = argc > 1 && std::string(argv[1]) == "--shader-check";
    if (shaderCheckOnly) {
      return skyrewind::checkShaderPrograms();
    }

    const char* catalogOverride = nullptr;
    if (argc > 2 && std::string(argv[1]) == "--catalog") {
      catalogOverride = argv[2];
    }

    const auto catalogPath = skyrewind::findCatalogPath(catalogOverride);
    const auto stars = skyrewind::loadHipparcosCatalog(catalogPath);
    std::cout << "Loaded " << stars.size() << " Hipparcos stars from " << catalogPath << '\n';
    if (checkOnly) {
      return EXIT_SUCCESS;
    }

    return skyrewind::runWindow(stars);
  } catch (const std::exception& error) {
    std::cerr << "skyrewind_cpp: " << error.what() << '\n';
    return EXIT_FAILURE;
  }
}
