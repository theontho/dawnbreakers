#include "Astronomy.hpp"

#include <algorithm>

namespace skyrewind {

double clamp(double value, double minValue, double maxValue) {
  return std::max(minValue, std::min(maxValue, value));
}

double wrapRadians(double value) {
  const double wrapped = std::fmod(value, kTau);
  return wrapped < 0.0 ? wrapped + kTau : wrapped;
}

double julianDayFromDecimalYear(double year) {
  return kJ2000JulianDay + (year - kJ2000Year) * 365.2425;
}

double greenwichMeanSiderealTime(double decimalYear) {
  const double jd = julianDayFromDecimalYear(decimalYear);
  const double t = (jd - kJ2000JulianDay) / 36525.0;
  const double degrees = 280.46061837 +
    360.98564736629 * (jd - kJ2000JulianDay) +
    0.000387933 * t * t -
    (t * t * t) / 38710000.0;
  return wrapRadians(degrees * kDegToRad);
}

double smootherStep(double value) {
  const double t = clamp(value, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

double easeInOutPower(double value, double power) {
  const double t = clamp(value, 0.0, 1.0);
  return t < 0.5
    ? std::pow(t * 2.0, power) / 2.0
    : 1.0 - std::pow((1.0 - t) * 2.0, power) / 2.0;
}

double cinematicInertiaEase(double value, const TimeCurve& curve) {
  const double t = clamp(value, 0.0, 1.0);
  const double inertiaPortion = clamp(curve.inertiaPortion, 0.0, 0.8);
  const double driftProgress = clamp(curve.driftProgress, 0.0, 0.2);
  const double power = clamp(curve.power, 1.0, 8.0);
  if (inertiaPortion <= 0.0) {
    return easeInOutPower(t, power);
  }

  const double transitionWidth = clamp(0.18 + inertiaPortion * 0.18, 0.12, 0.28);
  const double transitionStart = clamp(inertiaPortion - transitionWidth * 0.58, 0.0, 0.92);
  const double transitionEnd = clamp(inertiaPortion + transitionWidth * 0.42, transitionStart + 0.001, 0.96);
  const double driftInput = clamp(t / std::max(0.001, inertiaPortion), 0.0, 1.0);
  const double driftCurve = driftProgress * std::pow(driftInput, power);
  const double launchInput = clamp((t - transitionStart) / std::max(0.001, 1.0 - transitionStart), 0.0, 1.0);
  const double launchCurve = driftProgress + (1.0 - driftProgress) * easeInOutPower(launchInput, power);
  const double blend = smootherStep((t - transitionStart) / (transitionEnd - transitionStart));
  return driftCurve * (1.0 - blend) + launchCurve * blend;
}

double normalizedMotionStrength(double speed, double startYear, double targetYear, double durationSeconds) {
  const double averageSpeed = std::abs(targetYear - startYear) / std::max(0.001, durationSeconds);
  if (averageSpeed <= 0.0) {
    return 0.0;
  }

  const double ratio = std::abs(speed) / averageSpeed;
  return clamp((ratio - 0.08) / 2.15, 0.0, 1.0);
}

ProjectionUniforms makeProjectionUniforms(double decimalYear, const Location& location) {
  const double yearsSinceCatalog = decimalYear - kHipparcosCatalogEpochYear;
  const double centuries = (decimalYear - kJ2000Year) / 100.0;
  const double zeta = (
    2306.2181 * centuries +
    0.30188 * centuries * centuries +
    0.017998 * centuries * centuries * centuries
  ) * kArcsecToRad;
  const double z = (
    2306.2181 * centuries +
    1.09468 * centuries * centuries +
    0.018203 * centuries * centuries * centuries
  ) * kArcsecToRad;
  const double theta = (
    2004.3109 * centuries -
    0.42665 * centuries * centuries -
    0.041833 * centuries * centuries * centuries
  ) * kArcsecToRad;

  return {
    static_cast<float>(yearsSinceCatalog),
    static_cast<float>(zeta),
    static_cast<float>(z),
    static_cast<float>(std::cos(theta)),
    static_cast<float>(std::sin(theta)),
    static_cast<float>(greenwichMeanSiderealTime(decimalYear) + location.longitudeRadians),
    static_cast<float>(std::sin(location.latitudeRadians)),
    static_cast<float>(std::cos(location.latitudeRadians)),
  };
}

} // namespace skyrewind
