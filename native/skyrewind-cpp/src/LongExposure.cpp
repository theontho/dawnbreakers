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

void clearFramebuffer(GLuint framebuffer, int width, int height) {
  glBindFramebuffer(GL_FRAMEBUFFER, framebuffer);
  glViewport(0, 0, width, height);
  glClearColor(0.002f, 0.005f, 0.018f, 1.0f);
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
    uniform float uStrength;

    in vec2 vUv;
    out vec4 fragColor;

    void main() {
      vec3 current = texture(uCurrentFrame, vUv).rgb;
      vec3 history = texture(uHistory, vUv).rgb * uRetention;
      vec3 exposed = max(current, history);
      fragColor = vec4(mix(current, exposed, uStrength), 1.0);
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
    glGenFramebuffers(2, buffer.historyFramebuffers);
    glGenTextures(2, buffer.historyTextures);
    glGenVertexArrays(1, &buffer.fullscreenVao);
  }

  buffer.width = safeWidth;
  buffer.height = safeHeight;
  configureTexture(buffer.sceneTexture, safeWidth, safeHeight);
  attachTexture(buffer.sceneFramebuffer, buffer.sceneTexture);
  for (int i = 0; i < 2; ++i) {
    configureTexture(buffer.historyTextures[i], safeWidth, safeHeight);
    attachTexture(buffer.historyFramebuffers[i], buffer.historyTextures[i]);
    clearFramebuffer(buffer.historyFramebuffers[i], safeWidth, safeHeight);
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

void resolveLongExposure(
  LongExposureBuffer& buffer,
  GLuint program,
  float retention,
  float strength,
  bool resetHistory
) {
  const int writeIndex = 1 - buffer.historyIndex;
  const bool useHistory = buffer.historyValid && !resetHistory;

  glDisable(GL_BLEND);
  glBindFramebuffer(GL_FRAMEBUFFER, buffer.historyFramebuffers[writeIndex]);
  glViewport(0, 0, buffer.width, buffer.height);
  glUseProgram(program);
  glActiveTexture(GL_TEXTURE0);
  glBindTexture(GL_TEXTURE_2D, buffer.sceneTexture);
  glUniform1i(glGetUniformLocation(program, "uCurrentFrame"), 0);
  glActiveTexture(GL_TEXTURE1);
  glBindTexture(GL_TEXTURE_2D, buffer.historyTextures[buffer.historyIndex]);
  glUniform1i(glGetUniformLocation(program, "uHistory"), 1);
  glUniform1f(glGetUniformLocation(program, "uRetention"), useHistory ? std::clamp(retention, 0.0f, 1.0f) : 0.0f);
  glUniform1f(glGetUniformLocation(program, "uStrength"), useHistory ? std::clamp(strength, 0.0f, 1.0f) : 0.0f);
  glBindVertexArray(buffer.fullscreenVao);
  glDrawArrays(GL_TRIANGLES, 0, 3);

  glBindFramebuffer(GL_READ_FRAMEBUFFER, buffer.historyFramebuffers[writeIndex]);
  glBindFramebuffer(GL_DRAW_FRAMEBUFFER, 0);
  glBlitFramebuffer(
    0,
    0,
    buffer.width,
    buffer.height,
    0,
    0,
    buffer.width,
    buffer.height,
    GL_COLOR_BUFFER_BIT,
    GL_NEAREST
  );

  glBindFramebuffer(GL_READ_FRAMEBUFFER, 0);
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
  glDeleteTextures(2, buffer.historyTextures);
  if (buffer.sceneFramebuffer != 0) {
    glDeleteFramebuffers(1, &buffer.sceneFramebuffer);
  }
  glDeleteFramebuffers(2, buffer.historyFramebuffers);
  buffer = {};
}

} // namespace skyrewind
