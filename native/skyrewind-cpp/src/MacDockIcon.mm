#include "MacDockIcon.hpp"

#import <Cocoa/Cocoa.h>

#include <cstring>

namespace skyrewind {

void setMacDockIcon(const std::uint8_t* rgbaPixels, int width, int height) {
  if (rgbaPixels == nullptr || width <= 0 || height <= 0) {
    return;
  }

  @autoreleasepool {
    NSBitmapImageRep* rep = [[NSBitmapImageRep alloc]
      initWithBitmapDataPlanes:nullptr
                    pixelsWide:width
                    pixelsHigh:height
                 bitsPerSample:8
               samplesPerPixel:4
                      hasAlpha:YES
                      isPlanar:NO
                colorSpaceName:NSDeviceRGBColorSpace
                   bytesPerRow:width * 4
                  bitsPerPixel:32];
    if (rep == nil) {
      return;
    }

    std::memcpy([rep bitmapData], rgbaPixels, static_cast<std::size_t>(width * height * 4));
    NSImage* image = [[NSImage alloc] initWithSize:NSMakeSize(width, height)];
    [image addRepresentation:rep];
    [NSApp setApplicationIconImage:image];
  }
}

} // namespace skyrewind
