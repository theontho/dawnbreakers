#include "StarTrails.hpp"

namespace skyrewind {

const char* starTrailVertexShader() {
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
    uniform float uStartYearsSinceCatalog;
    uniform float uStartZeta;
    uniform float uStartZ;
    uniform float uStartCosTheta;
    uniform float uStartSinTheta;
    uniform float uStartLocalSiderealTime;
    uniform float uEndYearsSinceCatalog;
    uniform float uEndZeta;
    uniform float uEndZ;
    uniform float uEndCosTheta;
    uniform float uEndSinTheta;
    uniform float uEndLocalSiderealTime;
    uniform float uSinLat;
    uniform float uCosLat;
    uniform float uSkyRadius;
    uniform float uMaxVisibleMagnitude;
    uniform float uCinematicStrength;
    uniform float uHdrHighlightScale;
    uniform float uStarSizeScale;
    uniform float uTrailAlpha;
    uniform int uStreakStyle;
    uniform float uFovRadians;
    uniform float uAspect;
    uniform float uFisheyeBlend;

    out vec2 vStartNdc;
    out vec2 vEndNdc;
    out vec3 vColor;
    out float vAlpha;
    out float vRadiusPixels;

    vec3 skyPosition(
      float yearsSinceCatalog,
      float zeta,
      float z,
      float cosTheta,
      float sinTheta,
      float localSiderealTime
    ) {
      float currentDec = clamp(
        aDec + aPmDec * yearsSinceCatalog,
        -1.57079637,
        1.57079637
      );
      float cosDec = cos(currentDec);
      float sinDec = sin(currentDec);
      float raZeta = aRa + aPmRa * yearsSinceCatalog + zeta;
      float a = cosDec * sin(raZeta);
      float b = cosTheta * cosDec * cos(raZeta) - sinTheta * sinDec;
      float c = clamp(
        sinTheta * cosDec * cos(raZeta) + cosTheta * sinDec,
        -1.0,
        1.0
      );
      float precessedRa = atan(a, b) + z;
      float precessedCosDec = sqrt(max(0.0, 1.0 - c * c));
      float hourAngle = localSiderealTime - precessedRa;
      float east = -precessedCosDec * sin(hourAngle) * uSkyRadius;
      float up = (
        c * uSinLat +
        precessedCosDec * uCosLat * cos(hourAngle)
      ) * uSkyRadius;
      float north = (
        c * uCosLat -
        precessedCosDec * uSinLat * cos(hourAngle)
      ) * uSkyRadius;
      return vec3(east, up, -north);
    }

    vec2 projectDirection(vec3 worldPosition, out float visible) {
      vec4 viewPosition = uView * vec4(worldPosition, 1.0);
      vec3 viewDirection = normalize(viewPosition.xyz);
      float angularDistance = acos(clamp(-viewDirection.z, -1.0, 1.0));
      float halfFov = uFovRadians * 0.5;
      float perspectiveCorner = atan(
        tan(halfFov) * sqrt(1.0 + uAspect * uAspect)
      );
      float angularLimit = mix(
        perspectiveCorner,
        halfFov,
        uFisheyeBlend
      );
      visible = step(angularDistance, angularLimit);

      vec4 perspectivePosition = uProjection * viewPosition;
      vec2 perspectiveNdc =
        perspectivePosition.xy / max(0.0001, abs(perspectivePosition.w));
      float radialLength = length(viewDirection.xy);
      float fisheyeRadius =
        angularDistance / max(0.01, uFovRadians * 0.5);
      vec2 fisheyeNdc = radialLength > 0.00001
        ? vec2(
            viewDirection.x / radialLength * fisheyeRadius / uAspect,
            viewDirection.y / radialLength * fisheyeRadius
          )
        : vec2(0.0);
      return mix(perspectiveNdc, fisheyeNdc, uFisheyeBlend);
    }

    void main() {
      float startVisible = 0.0;
      float endVisible = 0.0;
      vStartNdc = projectDirection(
        skyPosition(
          uStartYearsSinceCatalog,
          uStartZeta,
          uStartZ,
          uStartCosTheta,
          uStartSinTheta,
          uStartLocalSiderealTime
        ),
        startVisible
      );
      vec3 endPosition = skyPosition(
        uEndYearsSinceCatalog,
        uEndZeta,
        uEndZ,
        uEndCosTheta,
        uEndSinTheta,
        uEndLocalSiderealTime
      );
      vEndNdc = projectDirection(endPosition, endVisible);

      float pathVisible = uStreakStyle == 3
        ? endVisible
        : startVisible * endVisible;
      float visible =
        step(aMagnitude, uMaxVisibleMagnitude) * pathVisible;
      float brightness = clamp(
        1.0 - (aMagnitude + 1.4) / 10.4,
        0.035,
        1.0
      );
      float thresholdFade = clamp(
        (uMaxVisibleMagnitude - aMagnitude) / 0.8,
        0.1,
        1.0
      );
      float lowerSkyDimming = endPosition.y < 0.0
        ? clamp(1.0 + (endPosition.y / uSkyRadius) * 0.82, 0.18, 1.0)
        : 1.0;
      float baseIntensity = clamp(
        (pow(brightness, 1.45) + uCinematicStrength * 0.09) *
          lowerSkyDimming * thresholdFade,
        0.018,
        1.0
      );
      float intensity =
        baseIntensity + pow(brightness, 4.0) * uHdrHighlightScale;
      float maxRadiance = 1.0 + uHdrHighlightScale;
      vColor = clamp(intensity * aColor, 0.0, maxRadiance);
      vAlpha = visible * uTrailAlpha;

      float starSize = (
        2.4 +
        sqrt(brightness) * 7.8 +
        uCinematicStrength * 5.5
      ) * uStarSizeScale;
      float perspectiveSizeScale =
        tan(radians(31.0)) / tan(max(0.01, uFovRadians * 0.5));
      float fisheyeSizeScale =
        radians(62.0) / max(0.01, uFovRadians);
      float angularSizeScale = clamp(
        mix(
          perspectiveSizeScale,
          fisheyeSizeScale,
          uFisheyeBlend
        ),
        0.35,
        2.5
      );
      vRadiusPixels = clamp(
        starSize * angularSizeScale * 0.32,
        0.75,
        5.0
      );
      gl_Position = vec4(vEndNdc, 0.0, 1.0);
    }
  )GLSL";
}

const char* starTrailGeometryShader() {
  return R"GLSL(
    #version 410 core

    layout(points) in;
    layout(triangle_strip, max_vertices = 4) out;

    uniform vec2 uViewport;
    uniform float uFixedWidthPixels;

    in vec2 vStartNdc[];
    in vec2 vEndNdc[];
    in vec3 vColor[];
    in float vAlpha[];
    in float vRadiusPixels[];

    flat out vec2 gStartPixels;
    flat out vec2 gEndPixels;
    flat out vec3 gColor;
    flat out float gAlpha;
    flat out float gRadiusPixels;

    vec2 toNdc(vec2 pixels) {
      return pixels / uViewport * 2.0 - 1.0;
    }

    void emitTrailVertex(vec2 pixels) {
      gl_Position = vec4(toNdc(pixels), 0.0, 1.0);
      EmitVertex();
    }

    void main() {
      if (vAlpha[0] <= 0.0) {
        return;
      }

      vec2 startPixels = (vStartNdc[0] * 0.5 + 0.5) * uViewport;
      vec2 endPixels = (vEndNdc[0] * 0.5 + 0.5) * uViewport;
      vec2 delta = endPixels - startPixels;
      float segmentLength = length(delta);
      if (segmentLength < 0.05) {
        return;
      }
      if (segmentLength > max(uViewport.x, uViewport.y) * 1.35) {
        return;
      }

      vec2 direction = delta / segmentLength;
      vec2 normal = vec2(-direction.y, direction.x);
      float radius = uFixedWidthPixels > 0.0
        ? uFixedWidthPixels * clamp(segmentLength / 42.0, 0.45, 1.65)
        : vRadiusPixels[0];
      vec2 startEdge = startPixels - direction * radius;
      vec2 endEdge = endPixels + direction * radius;

      gStartPixels = startPixels;
      gEndPixels = endPixels;
      gColor = vColor[0];
      gAlpha = vAlpha[0];
      gRadiusPixels = radius;

      emitTrailVertex(startEdge - normal * radius);
      emitTrailVertex(startEdge + normal * radius);
      emitTrailVertex(endEdge - normal * radius);
      emitTrailVertex(endEdge + normal * radius);
      EndPrimitive();
    }
  )GLSL";
}

const char* starTrailFragmentShader() {
  return R"GLSL(
    #version 410 core

    flat in vec2 gStartPixels;
    flat in vec2 gEndPixels;
    flat in vec3 gColor;
    flat in float gAlpha;
    flat in float gRadiusPixels;

    uniform float uSegmentStartProgress;
    uniform float uSegmentEndProgress;
    uniform int uCapStart;
    uniform int uCapEnd;
    uniform int uStreakStyle;

    out vec4 fragColor;

    void main() {
      vec2 segment = gEndPixels - gStartPixels;
      float segmentLengthSquared = max(dot(segment, segment), 0.0001);
      float rawProgress =
        dot(gl_FragCoord.xy - gStartPixels, segment) /
          segmentLengthSquared;
      if ((rawProgress < 0.0 && uCapStart == 0) ||
          (rawProgress > 1.0 && uCapEnd == 0)) {
        discard;
      }
      float progress = clamp(rawProgress, 0.0, 1.0);
      vec2 nearest = gStartPixels + segment * progress;
      float distanceToTrail = length(gl_FragCoord.xy - nearest);
      float coverage = 1.0 - smoothstep(
        gRadiusPixels * 0.2,
        gRadiusPixels,
        distanceToTrail
      );
      if (coverage <= 0.0) {
        discard;
      }

      float globalProgress = mix(
        uSegmentStartProgress,
        uSegmentEndProgress,
        progress
      );
      float exposureFade = uStreakStyle == 1
        ? 0.58
        : uStreakStyle == 3
          ? smoothstep(0.0, 1.0, globalProgress)
          : mix(
            0.2,
            0.78,
            smoothstep(0.0, 1.0, globalProgress)
          );
      float trailIntensity =
        coverage * exposureFade * gAlpha;
      fragColor = vec4(
        gColor * trailIntensity,
        trailIntensity
      );
    }
  )GLSL";
}

} // namespace skyrewind
