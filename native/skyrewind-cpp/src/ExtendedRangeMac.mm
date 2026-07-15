#include "ExtendedRange.hpp"

#include <algorithm>

#define GLFW_EXPOSE_NATIVE_COCOA
#define GLFW_EXPOSE_NATIVE_NSGL
#include <GLFW/glfw3.h>
#include <GLFW/glfw3native.h>

#import <Cocoa/Cocoa.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"

namespace skyrewind {
namespace {

ExtendedRangeState readState(GLFWwindow* window, bool floatingPointSurface) {
  NSWindow* nativeWindow = (NSWindow*)glfwGetCocoaWindow(window);
  NSScreen* screen = nativeWindow.screen ?: NSScreen.mainScreen;
  const float current = screen == nil
    ? 1.0f
    : static_cast<float>(screen.maximumExtendedDynamicRangeColorComponentValue);
  const float potential = screen == nil
    ? 1.0f
    : static_cast<float>(screen.maximumPotentialExtendedDynamicRangeColorComponentValue);
  return {
    floatingPointSurface,
    potential > 1.001f,
    std::max(1.0f, current),
    std::max(1.0f, potential),
  };
}

} // namespace

ExtendedRangeState configureExtendedRange(GLFWwindow* window) {
  @autoreleasepool {
    NSView* view = (NSView*)glfwGetCocoaView(window);
    NSWindow* nativeWindow = (NSWindow*)glfwGetCocoaWindow(window);
    NSOpenGLContext* context = (NSOpenGLContext*)glfwGetNSGLContext(window);

    view.wantsExtendedDynamicRangeOpenGLSurface = YES;
    view.wantsBestResolutionOpenGLSurface = YES;
    nativeWindow.colorSpace = NSColorSpace.extendedSRGBColorSpace;

    GLint colorFloat = 0;
    GLint virtualScreen = context.currentVirtualScreen;
    [context.pixelFormat getValues:&colorFloat
                      forAttribute:NSOpenGLPFAColorFloat
                   forVirtualScreen:virtualScreen];
    return readState(window, colorFloat != 0);
  }
}

ExtendedRangeState queryExtendedRange(GLFWwindow* window, bool floatingPointSurface) {
  @autoreleasepool {
    return readState(window, floatingPointSurface);
  }
}

} // namespace skyrewind

#pragma clang diagnostic pop
