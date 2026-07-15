#pragma once

#include <cmath>

namespace skyrewind {

constexpr double kPi = 3.14159265358979323846264338327950288;
constexpr double kHalfPi = kPi * 0.5;
constexpr double kTau = kPi * 2.0;
constexpr double kDegToRad = kPi / 180.0;
constexpr double kArcsecToRad = kDegToRad / 3600.0;
constexpr double kMasToRad = kArcsecToRad / 1000.0;
constexpr double kJ2000JulianDay = 2451545.0;
constexpr double kJ2000Year = 2000.0;
constexpr double kHipparcosCatalogEpochYear = 1991.25;

struct Location {
  double latitudeRadians = 30.0444 * kDegToRad;
  double longitudeRadians = 31.2357 * kDegToRad;
};

struct SkyDirection {
  float east = 0.0f;
  float up = 0.0f;
  float north = 0.0f;
};

struct MoonState {
  SkyDirection direction;
  SkyDirection sunDirection;
};

struct ProjectionUniforms {
  float yearsSinceCatalog = 0.0f;
  float zeta = 0.0f;
  float z = 0.0f;
  float cosTheta = 1.0f;
  float sinTheta = 0.0f;
  float localSiderealTime = 0.0f;
  float sinLatitude = 0.0f;
  float cosLatitude = 1.0f;
};

struct TimeCurve {
  double inertiaPortion = 0.32;
  double driftProgress = 0.000004;
  double power = 3.0;
};

double clamp(double value, double minValue, double maxValue);
double wrapRadians(double value);
double julianDayFromDecimalYear(double year);
double greenwichMeanSiderealTime(double decimalYear);
double cinematicInertiaEase(double value, const TimeCurve& curve);
double normalizedMotionStrength(double speed, double startYear, double targetYear, double durationSeconds);
ProjectionUniforms makeProjectionUniforms(double decimalYear, const Location& location);
MoonState moonState(double decimalYear, const Location& location);

} // namespace skyrewind
