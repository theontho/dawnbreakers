#pragma once

#ifdef __APPLE__
#include <OpenGL/gl3.h>
#else
#include <GL/gl.h>
#endif

namespace skyrewind {

struct LongExposureBuffer {
  GLuint sceneFramebuffer = 0;
  GLuint sceneTexture = 0;
  GLuint historyFramebuffers[2]{};
  GLuint historyTextures[2]{};
  GLuint fullscreenVao = 0;
  int width = 0;
  int height = 0;
  int historyIndex = 0;
  bool historyValid = false;
};

const char* longExposureVertexShader();
const char* longExposureFragmentShader();
const char* longExposureDisplayFragmentShader();
bool resizeLongExposureBuffer(LongExposureBuffer& buffer, int width, int height);
void beginLongExposureScene(const LongExposureBuffer& buffer);
void resolveLongExposure(
  LongExposureBuffer& buffer,
  GLuint accumulationProgram,
  GLuint displayProgram,
  float retention,
  float strength,
  bool resetHistory,
  int outputMode,
  float exposure,
  float headroom
);
void destroyLongExposureBuffer(LongExposureBuffer& buffer);

} // namespace skyrewind
