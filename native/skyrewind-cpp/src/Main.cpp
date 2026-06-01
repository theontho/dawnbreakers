#include "Astronomy.hpp"
#include "Catalog.hpp"
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
constexpr double kInitialYear = 1844.389;
constexpr double kDefaultRewindYears = 8000.0;
constexpr double kDefaultDurationSeconds = 14.0;

struct Vec3 {
  float x = 0.0f;
  float y = 0.0f;
  float z = 0.0f;
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
  bool active = true;
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

struct GuiState {
  float startYear = static_cast<float>(kInitialYear);
  float rewindYears = static_cast<float>(kDefaultRewindYears);
  float durationSeconds = static_cast<float>(kDefaultDurationSeconds);
  float inertiaPortion = 0.32f;
  float driftPercent = 0.0004f;
  float power = 3.0f;
  float latitudeDegrees = 29.5918f;
  float longitudeDegrees = 52.5837f;
  float faintMagnitudeLimit = 12.5f;
  float brightMagnitudeLimit = 1.6f;
  float starSizeScale = 1.0f;
  float horizonAlpha = 0.82f;
  float streakThreshold = 0.08f;
  float streakLengthYears = 0.42f;
  float streakWidthPixels = 3.5f;
  bool starStreaks = true;
  bool showHorizon = true;
  bool vsync = true;
  bool showControls = true;
};

struct AppState {
  CameraState camera;
  AnimationState animation;
  GuiState gui;
  Location location;
  int framebufferWidth = 1440;
  int framebufferHeight = 960;
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
  const Vec3 side = normalize(cross(forward, up));
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
    uniform float uStarSizeScale;

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

      float brightness = clamp(1.0 - (aMagnitude + 1.4) / 10.4, 0.035, 1.0);
      float thresholdFade = clamp((uMaxVisibleMagnitude - aMagnitude) / 0.8, 0.1, 1.0);
      float lowerSkyDimming = y < 0.0 ? clamp(1.0 + (y / uSkyRadius) * 0.82, 0.18, 1.0) : 1.0;
      float intensity = clamp((pow(brightness, 1.45) + uCinematicStrength * 0.09) * lowerSkyDimming * thresholdFade, 0.018, 1.0);

      vColor = vec3(
        clamp(intensity * aColor.r, 0.0, 1.0),
        clamp(intensity * aColor.g, 0.0, 1.0),
        clamp(intensity * (aColor.b + uCinematicStrength * 0.16), 0.0, 1.0)
      );
      vAlpha = visible;

      vec4 viewPosition = uView * vec4(x, y, zPosition, 1.0);
      float starSize = (2.4 + sqrt(brightness) * 7.8 + uCinematicStrength * 5.5) * uStarSizeScale;
      gl_PointSize = visible * starSize * (180.0 / max(12.0, -viewPosition.z));
      gl_Position = uProjection * viewPosition;
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
      float alpha = smoothstep(0.5, 0.08, dist);
      fragColor = vec4(vColor, alpha);
    }
  )GLSL";
}

const char* streakVertexShader() {
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
    uniform float uCurrentYearsSinceCatalog;
    uniform float uCurrentZeta;
    uniform float uCurrentZ;
    uniform float uCurrentCosTheta;
    uniform float uCurrentSinTheta;
    uniform float uCurrentLocalSiderealTime;
    uniform float uTailYearsSinceCatalog;
    uniform float uTailZeta;
    uniform float uTailZ;
    uniform float uTailCosTheta;
    uniform float uTailSinTheta;
    uniform float uTailLocalSiderealTime;
    uniform float uSinLat;
    uniform float uCosLat;
    uniform float uSkyRadius;
    uniform float uMaxVisibleMagnitude;
    uniform float uCinematicStrength;

    out StreakVertexData {
      vec4 tailClip;
      vec3 color;
      float alpha;
      float visible;
    } vData;

    vec4 projectStar(
      float yearsSinceCatalog,
      float zeta,
      float z,
      float cosTheta,
      float sinTheta,
      float localSiderealTime
    ) {
      float currentDec = clamp(aDec + aPmDec * yearsSinceCatalog, -1.57079637, 1.57079637);
      float cosDec = cos(currentDec);
      float sinDec = sin(currentDec);
      float raZeta = aRa + aPmRa * yearsSinceCatalog + zeta;
      float a = cosDec * sin(raZeta);
      float b = cosTheta * cosDec * cos(raZeta) - sinTheta * sinDec;
      float c = clamp(sinTheta * cosDec * cos(raZeta) + cosTheta * sinDec, -1.0, 1.0);
      float precessedRa = atan(a, b) + z;
      float precessedCosDec = sqrt(max(0.0, 1.0 - c * c));
      float hourAngle = localSiderealTime - precessedRa;
      float x = -precessedCosDec * sin(hourAngle) * uSkyRadius;
      float y = (c * uSinLat + precessedCosDec * uCosLat * cos(hourAngle)) * uSkyRadius;
      float north = c * uCosLat - precessedCosDec * uSinLat * cos(hourAngle);
      float zPosition = -north * uSkyRadius;
      return uProjection * uView * vec4(x, y, zPosition, 1.0);
    }

    void main() {
      float visible = step(aMagnitude, uMaxVisibleMagnitude);
      float brightness = clamp(1.0 - (aMagnitude + 1.4) / 10.4, 0.035, 1.0);
      float thresholdFade = clamp((uMaxVisibleMagnitude - aMagnitude) / 0.8, 0.1, 1.0);
      float intensity = clamp((pow(brightness, 1.35) + uCinematicStrength * 0.16) * thresholdFade, 0.02, 1.0);

      vData.color = vec3(
        clamp(intensity * aColor.r, 0.0, 1.0),
        clamp(intensity * aColor.g, 0.0, 1.0),
        clamp(intensity * (aColor.b + uCinematicStrength * 0.24), 0.0, 1.0)
      );
      vData.alpha = visible * clamp(0.38 + uCinematicStrength * 0.62, 0.0, 1.0);
      vData.visible = visible;
      gl_Position = projectStar(
        uCurrentYearsSinceCatalog,
        uCurrentZeta,
        uCurrentZ,
        uCurrentCosTheta,
        uCurrentSinTheta,
        uCurrentLocalSiderealTime
      );
      vData.tailClip = projectStar(
        uTailYearsSinceCatalog,
        uTailZeta,
        uTailZ,
        uTailCosTheta,
        uTailSinTheta,
        uTailLocalSiderealTime
      );
    }
  )GLSL";
}

const char* streakGeometryShader() {
  return R"GLSL(
    #version 410 core

    layout(points) in;
    layout(triangle_strip, max_vertices = 4) out;

    in StreakVertexData {
      vec4 tailClip;
      vec3 color;
      float alpha;
      float visible;
    } gIn[];

    uniform vec2 uViewport;
    uniform float uStreakWidthPixels;
    uniform float uMinStreakPixels;

    out vec3 gColor;
    out float gAlpha;

    void emitStreakVertex(vec4 clipPosition, vec2 normalNdc, float alpha) {
      gColor = gIn[0].color;
      gAlpha = alpha;
      gl_Position = vec4(clipPosition.xy + normalNdc * clipPosition.w, clipPosition.zw);
      EmitVertex();
    }

    void main() {
      if (gIn[0].visible <= 0.0) {
        return;
      }

      vec4 headClip = gl_in[0].gl_Position;
      vec4 tailClip = gIn[0].tailClip;
      if (headClip.w <= 0.0 || tailClip.w <= 0.0) {
        return;
      }

      vec2 headNdc = headClip.xy / headClip.w;
      vec2 tailNdc = tailClip.xy / tailClip.w;
      vec2 pixelDelta = (headNdc - tailNdc) * uViewport * 0.5;
      float pixelLength = length(pixelDelta);
      if (pixelLength < uMinStreakPixels || pixelLength > max(uViewport.x, uViewport.y) * 1.35) {
        return;
      }

      vec2 direction = normalize(headNdc - tailNdc);
      vec2 normal = vec2(-direction.y, direction.x);
      float width = uStreakWidthPixels * clamp(pixelLength / 42.0, 0.45, 1.65);
      vec2 normalNdc = normal * width * 2.0 / uViewport;
      float headAlpha = gIn[0].alpha;
      float tailAlpha = 0.0;

      emitStreakVertex(tailClip, -normalNdc, tailAlpha);
      emitStreakVertex(tailClip, normalNdc, tailAlpha);
      emitStreakVertex(headClip, -normalNdc, headAlpha);
      emitStreakVertex(headClip, normalNdc, headAlpha);
      EndPrimitive();
    }
  )GLSL";
}

const char* streakFragmentShader() {
  return R"GLSL(
    #version 410 core

    in vec3 gColor;
    in float gAlpha;
    out vec4 fragColor;

    void main() {
      fragColor = vec4(gColor, gAlpha);
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

    out vec4 vColor;

    void main() {
      vColor = vec4(aColor.rgb, aColor.a * uAlphaScale);
      gl_Position = uProjection * uView * vec4(aPosition, 1.0);
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
  if (key == GLFW_KEY_ESCAPE) {
    glfwSetWindowShouldClose(window, GLFW_TRUE);
    return;
  }
  if (ImGui::GetIO().WantCaptureKeyboard) {
    return;
  }
  if (key == GLFW_KEY_R) {
    restartAnimation(*app, glfwGetTime());
    return;
  }
  if (key == GLFW_KEY_SPACE) {
    const double now = glfwGetTime();
    if (!app->animation.active) {
      restartAnimation(*app, now);
      return;
    }
    if (app->animation.paused) {
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
  app->camera.dragging = action == GLFW_PRESS;
  glfwGetCursorPos(window, &app->camera.pointerX, &app->camera.pointerY);
}

void scrollCallback(GLFWwindow* window, double, double yOffset) {
  ImGui_ImplGlfw_ScrollCallback(window, 0.0, yOffset);
  if (ImGui::GetIO().WantCaptureMouse) {
    return;
  }
  auto* app = static_cast<AppState*>(glfwGetWindowUserPointer(window));
  const float fovDegrees = app->camera.fovRadians / static_cast<float>(kDegToRad);
  const float nextDegrees = clampFloat(fovDegrees - static_cast<float>(yOffset) * 2.0f, 34.0f, 92.0f);
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
  if (ImGui::Button(app.animation.paused || !app.animation.active ? "Play" : "Pause")) {
    const double now = glfwGetTime();
    if (!app.animation.active) {
      restartAnimation(app, now);
    } else if (app.animation.paused) {
      app.animation.pausedDuration += now - app.animation.pausedAt;
      app.animation.paused = false;
    } else {
      app.animation.pausedAt = now;
      app.animation.paused = true;
    }
  }
  ImGui::SameLine();
  if (ImGui::Button("Restart")) {
    restartAnimation(app, glfwGetTime());
  }
  ImGui::Text("Current year: %.2f", app.animation.currentYear);

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
  if (ImGui::SliderFloat("Fast bright limit", &app.gui.brightMagnitudeLimit, -1.5f, 5.0f, "%.1f")) {
    app.gui.brightMagnitudeLimit = std::min(app.gui.brightMagnitudeLimit, app.gui.faintMagnitudeLimit - 0.1f);
  }
  ImGui::SliderFloat("Star size", &app.gui.starSizeScale, 0.25f, 3.0f, "%.2f");
  ImGui::Checkbox("Star streaks", &app.gui.starStreaks);
  ImGui::SliderFloat("Streak threshold", &app.gui.streakThreshold, 0.02f, 0.8f, "%.2f");
  ImGui::SliderFloat("Streak length", &app.gui.streakLengthYears, 0.03f, 1.2f, "%.2f sky yr");
  ImGui::SliderFloat("Streak width", &app.gui.streakWidthPixels, 0.8f, 8.0f, "%.1f px");
  ImGui::Checkbox("Horizon guide", &app.gui.showHorizon);
  ImGui::SliderFloat("Horizon opacity", &app.gui.horizonAlpha, 0.1f, 1.0f, "%.2f");
  if (ImGui::SliderFloat("FOV", &app.camera.fovRadians, 34.0f * static_cast<float>(kDegToRad), 92.0f * static_cast<float>(kDegToRad), "%.3f rad")) {
  }
  if (ImGui::Checkbox("VSync", &app.gui.vsync)) {
    glfwSwapInterval(app.gui.vsync ? 1 : 0);
  }
  ImGui::TextDisabled("F1 hides/shows this panel.");
  ImGui::End();
}

std::string makeTitle(double fps, const AnimationState& animation, std::size_t starCount) {
  std::ostringstream title;
  title << "Sky Rewind C++ | "
        << std::fixed << std::setprecision(0) << fps << " FPS | "
        << std::setprecision(1) << animation.currentYear << " CE | "
        << starCount << " Hipparcos stars | Space play/pause | R restart";
  return title.str();
}

int checkShaderPrograms() {
  if (!glfwInit()) {
    throw std::runtime_error("Unable to initialize GLFW for shader check.");
  }

  glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
  glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 1);
  glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
  glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GLFW_TRUE);
  glfwWindowHint(GLFW_VISIBLE, GLFW_FALSE);

  GLFWwindow* window = glfwCreateWindow(64, 64, "Sky Rewind Shader Check", nullptr, nullptr);
  if (!window) {
    glfwTerminate();
    throw std::runtime_error("Unable to create hidden OpenGL window for shader check.");
  }

  glfwMakeContextCurrent(window);
  const GlProgram starsProgram = makeProgram(starVertexShader(), starFragmentShader());
  const GlProgram streakProgram = makeProgram(streakVertexShader(), streakFragmentShader(), streakGeometryShader());
  const GlProgram guideProgram = makeProgram(guideVertexShader(), guideFragmentShader());
  glDeleteProgram(guideProgram.id);
  glDeleteProgram(streakProgram.id);
  glDeleteProgram(starsProgram.id);
  glfwDestroyWindow(window);
  glfwTerminate();
  std::cout << "OpenGL shader check passed.\n";
  return EXIT_SUCCESS;
}

int runWindow(const std::vector<StarVertex>& stars) {
  if (!glfwInit()) {
    throw std::runtime_error("Unable to initialize GLFW.");
  }

  glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
  glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 1);
  glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
  glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GLFW_TRUE);
  glfwWindowHint(GLFW_SAMPLES, 0);

  GLFWwindow* window = glfwCreateWindow(1440, 960, "Sky Rewind C++", nullptr, nullptr);
  if (!window) {
    glfwTerminate();
    throw std::runtime_error("Unable to create native OpenGL window.");
  }
  setMoonWindowIcon(window);

  AppState app;
  restartAnimation(app, glfwGetTime());
  glfwSetWindowUserPointer(window, &app);
  glfwSetKeyCallback(window, keyCallback);
  glfwSetCursorPosCallback(window, cursorCallback);
  glfwSetMouseButtonCallback(window, mouseButtonCallback);
  glfwSetScrollCallback(window, scrollCallback);
  glfwSetCharCallback(window, charCallback);
  glfwSetFramebufferSizeCallback(window, framebufferSizeCallback);
  glfwMakeContextCurrent(window);
  glfwSwapInterval(1);
  glfwGetFramebufferSize(window, &app.framebufferWidth, &app.framebufferHeight);
  glViewport(0, 0, app.framebufferWidth, app.framebufferHeight);

  glEnable(GL_PROGRAM_POINT_SIZE);
  glEnable(GL_BLEND);
  glBlendFunc(GL_SRC_ALPHA, GL_ONE);

  IMGUI_CHECKVERSION();
  ImGui::CreateContext();
  ImGui::GetIO().ConfigFlags |= ImGuiConfigFlags_NavEnableKeyboard;
  ImGui::StyleColorsDark();
  ImGui_ImplGlfw_InitForOpenGL(window, false);
  ImGui_ImplOpenGL3_Init("#version 410");

  const GlProgram starsProgram = makeProgram(starVertexShader(), starFragmentShader());
  const GlProgram streakProgram = makeProgram(streakVertexShader(), streakFragmentShader(), streakGeometryShader());
  const GlProgram guideProgram = makeProgram(guideVertexShader(), guideFragmentShader());
  GLuint vao = 0;
  GLuint vbo = 0;
  GLuint guideVao = 0;
  GLuint guideVbo = 0;
  const std::vector<GuideVertex> guideVertices = makeHorizonGuideVertices();
  glGenVertexArrays(1, &vao);
  glGenBuffers(1, &vbo);
  glGenVertexArrays(1, &guideVao);
  glGenBuffers(1, &guideVbo);
  uploadStarAttributes(vao, vbo, stars);
  uploadGuideAttributes(guideVao, guideVbo, guideVertices);

  double lastFrameTime = glfwGetTime();
  double lastTitleTime = lastFrameTime;
  double smoothedFps = 0.0;

  while (!glfwWindowShouldClose(window)) {
    glfwPollEvents();
    const double now = glfwGetTime();
    const double delta = std::max(0.001, now - lastFrameTime);
    lastFrameTime = now;
    const double instantFps = 1.0 / delta;
    smoothedFps = smoothedFps == 0.0 ? instantFps : smoothedFps * 0.9 + instantFps * 0.1;

    ImGui_ImplOpenGL3_NewFrame();
    ImGui_ImplGlfw_NewFrame();
    ImGui::NewFrame();
    drawControls(app, smoothedFps, stars.size());

    applyGuiSettings(app);
    updateAnimation(app.animation, now, delta);
    const ProjectionUniforms projection = makeProjectionUniforms(app.animation.currentYear, app.location);
    const float cinematicStrength = static_cast<float>(app.animation.motionStrength);
    const float maxVisibleMagnitude = maxMagnitudeForSpeed(
      cinematicStrength,
      app.gui.faintMagnitudeLimit,
      app.gui.brightMagnitudeLimit
    );
    const float aspect = static_cast<float>(app.framebufferWidth) / static_cast<float>(std::max(1, app.framebufferHeight));
    const Mat4 projectionMatrix = perspective(app.camera.fovRadians, aspect, 0.1f, 500.0f);
    const Vec3 direction = {
      std::cos(app.camera.pitch) * std::sin(app.camera.yaw),
      std::sin(app.camera.pitch),
      -std::cos(app.camera.pitch) * std::cos(app.camera.yaw),
    };
    const Mat4 viewMatrix = lookAt({0.0f, 0.0f, 0.0f}, direction, {0.0f, 1.0f, 0.0f});

    glClearColor(0.002f, 0.005f, 0.018f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);

    const bool streaksActive = app.gui.starStreaks &&
      cinematicStrength > app.gui.streakThreshold &&
      !app.camera.dragging &&
      app.animation.active &&
      !app.animation.paused;
    if (streaksActive) {
      const double rawTailDeltaYears = -app.animation.speed * delta;
      const double maxTailDeltaYears = static_cast<double>(app.gui.streakLengthYears);
      const double tailDeltaYears = clamp(rawTailDeltaYears, -maxTailDeltaYears, maxTailDeltaYears);
      const double tailYear = app.animation.currentYear + tailDeltaYears;
      const ProjectionUniforms tailProjection = makeProjectionUniforms(tailYear, app.location);
      const float normalizedStreak = std::clamp(
        (cinematicStrength - app.gui.streakThreshold) / std::max(0.001f, 1.0f - app.gui.streakThreshold),
        0.0f,
        1.0f
      );

      glBlendFunc(GL_SRC_ALPHA, GL_ONE);
      glUseProgram(streakProgram.id);
      glUniformMatrix4fv(glGetUniformLocation(streakProgram.id, "uView"), 1, GL_FALSE, viewMatrix.m.data());
      glUniformMatrix4fv(glGetUniformLocation(streakProgram.id, "uProjection"), 1, GL_FALSE, projectionMatrix.m.data());
      glUniform1f(glGetUniformLocation(streakProgram.id, "uCurrentYearsSinceCatalog"), projection.yearsSinceCatalog);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uCurrentZeta"), projection.zeta);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uCurrentZ"), projection.z);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uCurrentCosTheta"), projection.cosTheta);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uCurrentSinTheta"), projection.sinTheta);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uCurrentLocalSiderealTime"), projection.localSiderealTime);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uTailYearsSinceCatalog"), tailProjection.yearsSinceCatalog);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uTailZeta"), tailProjection.zeta);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uTailZ"), tailProjection.z);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uTailCosTheta"), tailProjection.cosTheta);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uTailSinTheta"), tailProjection.sinTheta);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uTailLocalSiderealTime"), tailProjection.localSiderealTime);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uSinLat"), projection.sinLatitude);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uCosLat"), projection.cosLatitude);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uSkyRadius"), kSkyRadius);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uMaxVisibleMagnitude"), maxVisibleMagnitude);
      glUniform1f(glGetUniformLocation(streakProgram.id, "uCinematicStrength"), cinematicStrength);
      glUniform2f(
        glGetUniformLocation(streakProgram.id, "uViewport"),
        static_cast<float>(app.framebufferWidth),
        static_cast<float>(app.framebufferHeight)
      );
      glUniform1f(
        glGetUniformLocation(streakProgram.id, "uStreakWidthPixels"),
        app.gui.streakWidthPixels * (0.7f + normalizedStreak * 0.6f)
      );
      glUniform1f(glGetUniformLocation(streakProgram.id, "uMinStreakPixels"), 1.0f + normalizedStreak * 2.0f);
      glBindVertexArray(vao);
      glDrawArrays(GL_POINTS, 0, static_cast<GLsizei>(stars.size()));
    }

    glUseProgram(starsProgram.id);
    glUniformMatrix4fv(glGetUniformLocation(starsProgram.id, "uView"), 1, GL_FALSE, viewMatrix.m.data());
    glUniformMatrix4fv(glGetUniformLocation(starsProgram.id, "uProjection"), 1, GL_FALSE, projectionMatrix.m.data());
    glUniform1f(glGetUniformLocation(starsProgram.id, "uYearsSinceCatalog"), projection.yearsSinceCatalog);
    glUniform1f(glGetUniformLocation(starsProgram.id, "uZeta"), projection.zeta);
    glUniform1f(glGetUniformLocation(starsProgram.id, "uZ"), projection.z);
    glUniform1f(glGetUniformLocation(starsProgram.id, "uCosTheta"), projection.cosTheta);
    glUniform1f(glGetUniformLocation(starsProgram.id, "uSinTheta"), projection.sinTheta);
    glUniform1f(glGetUniformLocation(starsProgram.id, "uLocalSiderealTime"), projection.localSiderealTime);
    glUniform1f(glGetUniformLocation(starsProgram.id, "uSinLat"), projection.sinLatitude);
    glUniform1f(glGetUniformLocation(starsProgram.id, "uCosLat"), projection.cosLatitude);
    glUniform1f(glGetUniformLocation(starsProgram.id, "uSkyRadius"), kSkyRadius);
    glUniform1f(glGetUniformLocation(starsProgram.id, "uMaxVisibleMagnitude"), maxVisibleMagnitude);
    glUniform1f(glGetUniformLocation(starsProgram.id, "uCinematicStrength"), cinematicStrength);
    glUniform1f(glGetUniformLocation(starsProgram.id, "uStarSizeScale"), app.gui.starSizeScale);
    glBindVertexArray(vao);
    glDrawArrays(GL_POINTS, 0, static_cast<GLsizei>(stars.size()));

    if (app.gui.showHorizon) {
      glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      glLineWidth(2.5f);
      glUseProgram(guideProgram.id);
      glUniformMatrix4fv(glGetUniformLocation(guideProgram.id, "uView"), 1, GL_FALSE, viewMatrix.m.data());
      glUniformMatrix4fv(glGetUniformLocation(guideProgram.id, "uProjection"), 1, GL_FALSE, projectionMatrix.m.data());
      glUniform1f(glGetUniformLocation(guideProgram.id, "uAlphaScale"), app.gui.horizonAlpha);
      glBindVertexArray(guideVao);
      glDrawArrays(GL_LINES, 0, static_cast<GLsizei>(guideVertices.size()));
      glBlendFunc(GL_SRC_ALPHA, GL_ONE);
    }

    ImGui::Render();
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
    glBlendFunc(GL_SRC_ALPHA, GL_ONE);

    if (now - lastTitleTime > 0.25) {
      glfwSetWindowTitle(window, makeTitle(smoothedFps, app.animation, stars.size()).c_str());
      lastTitleTime = now;
    }

    glfwSwapBuffers(window);
  }

  ImGui_ImplOpenGL3_Shutdown();
  ImGui_ImplGlfw_Shutdown();
  ImGui::DestroyContext();
  glDeleteBuffers(1, &guideVbo);
  glDeleteVertexArrays(1, &guideVao);
  glDeleteBuffers(1, &vbo);
  glDeleteVertexArrays(1, &vao);
  glDeleteProgram(guideProgram.id);
  glDeleteProgram(streakProgram.id);
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
