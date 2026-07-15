#include "Astronomy.hpp"

#include <algorithm>

namespace skyrewind {
namespace {

double degreesToWrappedRadians(double degrees) {
  return wrapRadians(degrees * kDegToRad);
}

} // namespace

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

SkyDirection moonDirection(double decimalYear, const Location& location) {
  const double daysSinceJ2000 = julianDayFromDecimalYear(decimalYear) - kJ2000JulianDay;
  const double ascendingNode = degreesToWrappedRadians(125.1228 - 0.0529538083 * daysSinceJ2000);
  const double inclination = 5.1454 * kDegToRad;
  const double argumentOfPerigee =
    degreesToWrappedRadians(318.0634 + 0.1643573223 * daysSinceJ2000);
  const double meanAnomaly =
    degreesToWrappedRadians(115.3654 + 13.0649929509 * daysSinceJ2000);
  constexpr double eccentricity = 0.0549;

  const double eccentricAnomaly =
    meanAnomaly +
    eccentricity * std::sin(meanAnomaly) * (1.0 + eccentricity * std::cos(meanAnomaly));
  const double orbitalX = std::cos(eccentricAnomaly) - eccentricity;
  const double orbitalY = std::sqrt(1.0 - eccentricity * eccentricity) * std::sin(eccentricAnomaly);
  const double trueAnomaly = std::atan2(orbitalY, orbitalX);
  const double orbitalArgumentOfLatitude = wrapRadians(trueAnomaly + argumentOfPerigee);
  const double baseEclipticLongitude = wrapRadians(
    ascendingNode +
    std::atan2(
      std::sin(orbitalArgumentOfLatitude) * std::cos(inclination),
      std::cos(orbitalArgumentOfLatitude)
    )
  );

  const double meanLongitude = wrapRadians(ascendingNode + argumentOfPerigee + meanAnomaly);
  const double solarMeanAnomaly =
    degreesToWrappedRadians(356.0470 + 0.9856002585 * daysSinceJ2000);
  const double solarPerihelion =
    degreesToWrappedRadians(282.9404 + 0.0000470935 * daysSinceJ2000);
  const double solarMeanLongitude = wrapRadians(solarMeanAnomaly + solarPerihelion);
  const double elongation = wrapRadians(meanLongitude - solarMeanLongitude);
  const double argumentOfLatitude = wrapRadians(meanLongitude - ascendingNode);

  const double longitudeCorrectionDegrees =
    -1.274 * std::sin(meanAnomaly - 2.0 * elongation) +
    0.658 * std::sin(2.0 * elongation) -
    0.186 * std::sin(solarMeanAnomaly) -
    0.059 * std::sin(2.0 * meanAnomaly - 2.0 * elongation) -
    0.057 * std::sin(meanAnomaly - 2.0 * elongation + solarMeanAnomaly) +
    0.053 * std::sin(meanAnomaly + 2.0 * elongation) +
    0.046 * std::sin(2.0 * elongation - solarMeanAnomaly) +
    0.041 * std::sin(meanAnomaly - solarMeanAnomaly) -
    0.035 * std::sin(elongation) -
    0.031 * std::sin(meanAnomaly + solarMeanAnomaly) -
    0.015 * std::sin(2.0 * argumentOfLatitude - 2.0 * elongation) +
    0.011 * std::sin(meanAnomaly - 4.0 * elongation);
  const double latitudeCorrectionDegrees =
    -0.173 * std::sin(argumentOfLatitude - 2.0 * elongation) -
    0.055 * std::sin(meanAnomaly - argumentOfLatitude - 2.0 * elongation) -
    0.046 * std::sin(meanAnomaly + argumentOfLatitude - 2.0 * elongation) +
    0.033 * std::sin(argumentOfLatitude + 2.0 * elongation) +
    0.017 * std::sin(2.0 * meanAnomaly + argumentOfLatitude);

  const double eclipticLongitude =
    wrapRadians(baseEclipticLongitude + longitudeCorrectionDegrees * kDegToRad);
  const double eclipticLatitude =
    std::asin(std::sin(orbitalArgumentOfLatitude) * std::sin(inclination)) +
    latitudeCorrectionDegrees * kDegToRad;
  const double obliquity =
    (23.4393 - 0.0000003563 * daysSinceJ2000) * kDegToRad;

  const double eclipticX = std::cos(eclipticLongitude) * std::cos(eclipticLatitude);
  const double eclipticY = std::sin(eclipticLongitude) * std::cos(eclipticLatitude);
  const double eclipticZ = std::sin(eclipticLatitude);
  const double equatorialX = eclipticX;
  const double equatorialY = eclipticY * std::cos(obliquity) - eclipticZ * std::sin(obliquity);
  const double equatorialZ = eclipticY * std::sin(obliquity) + eclipticZ * std::cos(obliquity);
  const double rightAscension = std::atan2(equatorialY, equatorialX);
  const double declination = std::asin(clamp(equatorialZ, -1.0, 1.0));
  const double hourAngle =
    greenwichMeanSiderealTime(decimalYear) + location.longitudeRadians - rightAscension;
  const double cosDeclination = std::cos(declination);
  const double sinDeclination = std::sin(declination);
  const double sinLatitude = std::sin(location.latitudeRadians);
  const double cosLatitude = std::cos(location.latitudeRadians);

  return {
    static_cast<float>(-cosDeclination * std::sin(hourAngle)),
    static_cast<float>(
      sinDeclination * sinLatitude +
      cosDeclination * cosLatitude * std::cos(hourAngle)
    ),
    static_cast<float>(
      sinDeclination * cosLatitude -
      cosDeclination * sinLatitude * std::cos(hourAngle)
    ),
  };
}

} // namespace skyrewind
