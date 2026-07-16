#include "LongExposure.hpp"

#include <algorithm>
#include <stdexcept>
#include <string>

namespace skyrewind {
namespace {

void configureTexture(GLuint texture, int width, int height) {
  glBindTexture(GL_TEXTURE_2D, texture);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, width, height, 0, GL_RGBA, GL_FLOAT, nullptr);
}

void attachTexture(GLuint framebuffer, GLuint texture) {
  glBindFramebuffer(GL_FRAMEBUFFER, framebuffer);
  glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, texture, 0);
  if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE) {
    throw std::runtime_error("Unable to create long-exposure framebuffer.");
  }
}

void clearFramebuffer(
  GLuint framebuffer,
  int width,
  int height,
  float red,
  float green,
  float blue
) {
  glBindFramebuffer(GL_FRAMEBUFFER, framebuffer);
  glViewport(0, 0, width, height);
  glClearColor(red, green, blue, 1.0f);
  glClear(GL_COLOR_BUFFER_BIT);
}

} // namespace

const char* longExposureVertexShader() {
  return R"GLSL(
    #version 410 core

    out vec2 vUv;

    void main() {
      const vec2 positions[3] = vec2[](
        vec2(-1.0, -1.0),
        vec2(3.0, -1.0),
        vec2(-1.0, 3.0)
      );
      vec2 position = positions[gl_VertexID];
      vUv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  )GLSL";
}

const char* longExposureFragmentShader() {
  return R"GLSL(
    #version 410 core

    uniform sampler2D uCurrentFrame;
    uniform sampler2D uHistory;
    uniform float uRetention;

    in vec2 vUv;
    out vec4 fragColor;

    void main() {
      vec3 current = texture(uCurrentFrame, vUv).rgb;
      vec3 history = texture(uHistory, vUv).rgb * uRetention;
      fragColor = vec4(max(current, history), 1.0);
    }
  )GLSL";
}

const char* longExposureDisplayFragmentShader() {
  return R"GLSL(
    #version 410 core

    uniform sampler2D uImage;
    uniform sampler2D uCurrentFrame;
    uniform int uOutputMode;
    uniform float uExposure;
    uniform float uHeadroom;

    in vec2 vUv;
    out vec4 fragColor;

    vec3 acesToneMap(vec3 color) {
      const float a = 2.51;
      const float b = 0.03;
      const float c = 2.43;
      const float d = 0.59;
      const float e = 0.14;
      return clamp(
        (color * (a * color + b)) /
        (color * (c * color + d) + e),
        0.0,
        1.0
      );
    }

    vec3 softClipEdr(vec3 color, float headroom) {
      float safeHeadroom = max(1.001, headroom);
      float knee = 1.0 + (safeHeadroom - 1.0) * 0.75;
      vec3 result = color;
      for (int channel = 0; channel < 3; ++channel) {
        if (result[channel] > knee) {
          float range = safeHeadroom - knee;
          float excess = (result[channel] - knee) / range;
          result[channel] = knee + range * excess / (1.0 + excess);
        }
      }
      return clamp(result, 0.0, safeHeadroom);
    }

    void main() {
      vec3 current = texture(uCurrentFrame, vUv).rgb;
      vec3 history = texture(uImage, vUv).rgb;
      vec3 color = max(current, history) * exp2(uExposure);
      if (uOutputMode == 1) {
        color = acesToneMap(color);
      } else if (uOutputMode == 2) {
        color = softClipEdr(color, uHeadroom);
      } else {
        color = clamp(color, 0.0, 1.0);
      }
      fragColor = vec4(color, 1.0);
    }
  )GLSL";
}

bool resizeLongExposureBuffer(LongExposureBuffer& buffer, int width, int height) {
  const int safeWidth = std::max(1, width);
  const int safeHeight = std::max(1, height);
  if (buffer.width == safeWidth && buffer.height == safeHeight) {
    return false;
  }

  if (buffer.sceneFramebuffer == 0) {
    glGenFramebuffers(1, &buffer.sceneFramebuffer);
    glGenTextures(1, &buffer.sceneTexture);
    glGenFramebuffers(1, &buffer.trailFramebuffer);
    glGenTextures(1, &buffer.trailTexture);
    glGenFramebuffers(2, buffer.historyFramebuffers);
    glGenTextures(2, buffer.historyTextures);
    glGenVertexArrays(1, &buffer.fullscreenVao);
  }

  buffer.width = safeWidth;
  buffer.height = safeHeight;
  configureTexture(buffer.sceneTexture, safeWidth, safeHeight);
  attachTexture(buffer.sceneFramebuffer, buffer.sceneTexture);
  configureTexture(buffer.trailTexture, safeWidth, safeHeight);
  attachTexture(buffer.trailFramebuffer, buffer.trailTexture);
  for (int i = 0; i < 2; ++i) {
    configureTexture(buffer.historyTextures[i], safeWidth, safeHeight);
    attachTexture(buffer.historyFramebuffers[i], buffer.historyTextures[i]);
    clearFramebuffer(
      buffer.historyFramebuffers[i],
      safeWidth,
      safeHeight,
      0.0f,
      0.0f,
      0.0f
    );
  }

  buffer.historyIndex = 0;
  buffer.historyValid = false;
  glBindFramebuffer(GL_FRAMEBUFFER, 0);
  return true;
}

void beginLongExposureScene(const LongExposureBuffer& buffer) {
  glBindFramebuffer(GL_FRAMEBUFFER, buffer.sceneFramebuffer);
  glViewport(0, 0, buffer.width, buffer.height);
  glClearColor(0.002f, 0.005f, 0.018f, 1.0f);
  glClear(GL_COLOR_BUFFER_BIT);
}

void beginLongExposureTrails(const LongExposureBuffer& buffer) {
  glBindFramebuffer(GL_FRAMEBUFFER, buffer.trailFramebuffer);
  glViewport(0, 0, buffer.width, buffer.height);
  glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
  glClear(GL_COLOR_BUFFER_BIT);
}

void resolveLongExposure(
  LongExposureBuffer& buffer,
  GLuint accumulationProgram,
  GLuint displayProgram,
  float retention,
  bool resetHistory,
  int outputMode,
  float exposure,
  float headroom
) {
  const int writeIndex = 1 - buffer.historyIndex;
  const bool useHistory = buffer.historyValid && !resetHistory;

  glDisable(GL_BLEND);
  glBindFramebuffer(GL_FRAMEBUFFER, buffer.historyFramebuffers[writeIndex]);
  glViewport(0, 0, buffer.width, buffer.height);
  glUseProgram(accumulationProgram);
  glActiveTexture(GL_TEXTURE0);
  glBindTexture(GL_TEXTURE_2D, buffer.trailTexture);
  glUniform1i(glGetUniformLocation(accumulationProgram, "uCurrentFrame"), 0);
  glActiveTexture(GL_TEXTURE1);
  glBindTexture(GL_TEXTURE_2D, buffer.historyTextures[buffer.historyIndex]);
  glUniform1i(glGetUniformLocation(accumulationProgram, "uHistory"), 1);
  glUniform1f(
    glGetUniformLocation(accumulationProgram, "uRetention"),
    useHistory ? std::clamp(retention, 0.0f, 1.0f) : 0.0f
  );
  glBindVertexArray(buffer.fullscreenVao);
  glDrawArrays(GL_TRIANGLES, 0, 3);

  glBindFramebuffer(GL_FRAMEBUFFER, 0);
  glViewport(0, 0, buffer.width, buffer.height);
  glUseProgram(displayProgram);
  glActiveTexture(GL_TEXTURE0);
  glBindTexture(GL_TEXTURE_2D, buffer.historyTextures[writeIndex]);
  glUniform1i(glGetUniformLocation(displayProgram, "uImage"), 0);
  glActiveTexture(GL_TEXTURE1);
  glBindTexture(GL_TEXTURE_2D, buffer.sceneTexture);
  glUniform1i(
    glGetUniformLocation(displayProgram, "uCurrentFrame"),
    1
  );
  glUniform1i(glGetUniformLocation(displayProgram, "uOutputMode"), outputMode);
  glUniform1f(glGetUniformLocation(displayProgram, "uExposure"), exposure);
  glUniform1f(glGetUniformLocation(displayProgram, "uHeadroom"), std::max(1.0f, headroom));
  glDrawArrays(GL_TRIANGLES, 0, 3);

  glActiveTexture(GL_TEXTURE1);
  glBindTexture(GL_TEXTURE_2D, 0);
  glActiveTexture(GL_TEXTURE0);
  glBindTexture(GL_TEXTURE_2D, 0);
  glBindVertexArray(0);
  glEnable(GL_BLEND);
  buffer.historyIndex = writeIndex;
  buffer.historyValid = true;
}

void destroyLongExposureBuffer(LongExposureBuffer& buffer) {
  if (buffer.fullscreenVao != 0) {
    glDeleteVertexArrays(1, &buffer.fullscreenVao);
  }
  if (buffer.sceneTexture != 0) {
    glDeleteTextures(1, &buffer.sceneTexture);
  }
  if (buffer.trailTexture != 0) {
    glDeleteTextures(1, &buffer.trailTexture);
  }
  glDeleteTextures(2, buffer.historyTextures);
  if (buffer.sceneFramebuffer != 0) {
    glDeleteFramebuffers(1, &buffer.sceneFramebuffer);
  }
  if (buffer.trailFramebuffer != 0) {
    glDeleteFramebuffers(1, &buffer.trailFramebuffer);
  }
  glDeleteFramebuffers(2, buffer.historyFramebuffers);
  buffer = {};
}

} // namespace skyrewind
