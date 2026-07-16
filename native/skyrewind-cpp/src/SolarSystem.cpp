#include "SolarSystem.hpp"

#include <algorithm>
#include <cmath>

namespace skyrewind {
namespace {

constexpr double kAstronomicalUnitKilometers = 149597870.7;

struct Vec3d {
  double x = 0.0;
  double y = 0.0;
  double z = 0.0;
};

struct OrbitalElements {
  double ascendingNode = 0.0;
  double inclination = 0.0;
  double argumentOfPerihelion = 0.0;
  double semiMajorAxis = 1.0;
  double eccentricity = 0.0;
  double meanAnomaly = 0.0;
};

struct OrbitalPosition {
  Vec3d position;
  double radius = 1.0;
  double longitude = 0.0;
  double latitude = 0.0;
  double meanAnomaly = 0.0;
};

double radians(double degrees) {
  return wrapRadians(degrees * kDegToRad);
}

double solveEccentricAnomaly(double meanAnomaly, double eccentricity) {
  double eccentricAnomaly = meanAnomaly;
  for (int iteration = 0; iteration < 12; ++iteration) {
    const double correction = (
      eccentricAnomaly -
      eccentricity * std::sin(eccentricAnomaly) -
      meanAnomaly
    ) / (1.0 - eccentricity * std::cos(eccentricAnomaly));
    eccentricAnomaly -= correction;
    if (std::abs(correction) < 1.0e-10) {
      break;
    }
  }
  return eccentricAnomaly;
}

OrbitalPosition orbitalPosition(const OrbitalElements& elements) {
  const double eccentricAnomaly =
    solveEccentricAnomaly(elements.meanAnomaly, elements.eccentricity);
  const double orbitalX =
    elements.semiMajorAxis * (std::cos(eccentricAnomaly) - elements.eccentricity);
  const double orbitalY =
    elements.semiMajorAxis *
    std::sqrt(1.0 - elements.eccentricity * elements.eccentricity) *
    std::sin(eccentricAnomaly);
  const double trueAnomaly = std::atan2(orbitalY, orbitalX);
  const double radius = std::hypot(orbitalX, orbitalY);
  const double argument = trueAnomaly + elements.argumentOfPerihelion;
  const double cosNode = std::cos(elements.ascendingNode);
  const double sinNode = std::sin(elements.ascendingNode);
  const double cosInclination = std::cos(elements.inclination);
  const double sinInclination = std::sin(elements.inclination);
  const double cosArgument = std::cos(argument);
  const double sinArgument = std::sin(argument);
  const Vec3d position{
    radius * (cosNode * cosArgument - sinNode * sinArgument * cosInclination),
    radius * (sinNode * cosArgument + cosNode * sinArgument * cosInclination),
    radius * sinArgument * sinInclination,
  };
  return {
    position,
    radius,
    std::atan2(position.y, position.x),
    std::atan2(position.z, std::hypot(position.x, position.y)),
    elements.meanAnomaly,
  };
}

OrbitalElements sunElements(double days) {
  return {
    0.0,
    0.0,
    radians(282.9404 + 0.0000470935 * days),
    1.0,
    0.016709 - 0.000000001151 * days,
    radians(356.0470 + 0.9856002585 * days),
  };
}

OrbitalElements planetElements(SolarSystemBody body, double days) {
  switch (body) {
    case SolarSystemBody::Mercury:
      return {
        radians(48.3313 + 0.0000324587 * days),
        radians(7.0047 + 0.00000005 * days),
        radians(29.1241 + 0.0000101444 * days),
        0.387098,
        0.205635 + 0.000000000559 * days,
        radians(168.6562 + 4.0923344368 * days),
      };
    case SolarSystemBody::Venus:
      return {
        radians(76.6799 + 0.0000246590 * days),
        radians(3.3946 + 0.0000000275 * days),
        radians(54.8910 + 0.0000138374 * days),
        0.723330,
        0.006773 - 0.000000001302 * days,
        radians(48.0052 + 1.6021302244 * days),
      };
    case SolarSystemBody::Mars:
      return {
        radians(49.5574 + 0.0000211081 * days),
        radians(1.8497 - 0.0000000178 * days),
        radians(286.5016 + 0.0000292961 * days),
        1.523688,
        0.093405 + 0.000000002516 * days,
        radians(18.6021 + 0.5240207766 * days),
      };
    case SolarSystemBody::Jupiter:
      return {
        radians(100.4542 + 0.0000276854 * days),
        radians(1.3030 - 0.0000001557 * days),
        radians(273.8777 + 0.0000164505 * days),
        5.20256,
        0.048498 + 0.000000004469 * days,
        radians(19.8950 + 0.0830853001 * days),
      };
    case SolarSystemBody::Saturn:
      return {
        radians(113.6634 + 0.0000238980 * days),
        radians(2.4886 - 0.0000001081 * days),
        radians(339.3939 + 0.0000297661 * days),
        9.55475,
        0.055546 - 0.000000009499 * days,
        radians(316.9670 + 0.0334442282 * days),
      };
    case SolarSystemBody::Sun:
      return sunElements(days);
  }
  return {};
}

void applyOuterPlanetPerturbations(
  SolarSystemBody body,
  double jupiterMeanAnomaly,
  double saturnMeanAnomaly,
  OrbitalPosition& position
) {
  const auto sine = [](double angleDegrees) {
    return std::sin(angleDegrees * kDegToRad);
  };
  const auto cosine = [](double angleDegrees) {
    return std::cos(angleDegrees * kDegToRad);
  };
  const double jupiterDegrees = jupiterMeanAnomaly / kDegToRad;
  const double saturnDegrees = saturnMeanAnomaly / kDegToRad;
  double longitudeCorrection = 0.0;
  double latitudeCorrection = 0.0;

  if (body == SolarSystemBody::Jupiter) {
    longitudeCorrection =
      -0.332 * sine(2.0 * jupiterDegrees - 5.0 * saturnDegrees - 67.6) -
      0.056 * sine(2.0 * jupiterDegrees - 2.0 * saturnDegrees + 21.0) +
      0.042 * sine(3.0 * jupiterDegrees - 5.0 * saturnDegrees + 21.0) -
      0.036 * sine(jupiterDegrees - 2.0 * saturnDegrees) +
      0.022 * cosine(jupiterDegrees - saturnDegrees) +
      0.023 * sine(2.0 * jupiterDegrees - 3.0 * saturnDegrees + 52.0) -
      0.016 * sine(jupiterDegrees - 5.0 * saturnDegrees - 69.0);
  } else if (body == SolarSystemBody::Saturn) {
    longitudeCorrection =
      0.812 * sine(2.0 * jupiterDegrees - 5.0 * saturnDegrees - 67.6) -
      0.229 * cosine(2.0 * jupiterDegrees - 4.0 * saturnDegrees - 2.0) +
      0.119 * sine(jupiterDegrees - 2.0 * saturnDegrees - 3.0) +
      0.046 * sine(2.0 * jupiterDegrees - 6.0 * saturnDegrees - 69.0) +
      0.014 * sine(jupiterDegrees - 3.0 * saturnDegrees + 32.0);
    latitudeCorrection =
      -0.020 * cosine(2.0 * jupiterDegrees - 4.0 * saturnDegrees - 2.0) +
      0.018 * sine(2.0 * jupiterDegrees - 6.0 * saturnDegrees - 49.0);
  } else {
    return;
  }

  position.longitude = wrapRadians(position.longitude + longitudeCorrection * kDegToRad);
  position.latitude += latitudeCorrection * kDegToRad;
  const double cosLatitude = std::cos(position.latitude);
  position.position = {
    position.radius * cosLatitude * std::cos(position.longitude),
    position.radius * cosLatitude * std::sin(position.longitude),
    position.radius * std::sin(position.latitude),
  };
}

SkyDirection localDirection(
  Vec3d ecliptic,
  double days,
  double decimalYear,
  const Location& location
) {
  const double obliquity = (23.4393 - 0.0000003563 * days) * kDegToRad;
  const double equatorialX = ecliptic.x;
  const double equatorialY =
    ecliptic.y * std::cos(obliquity) - ecliptic.z * std::sin(obliquity);
  const double equatorialZ =
    ecliptic.y * std::sin(obliquity) + ecliptic.z * std::cos(obliquity);
  const double rightAscension = std::atan2(equatorialY, equatorialX);
  const double declination =
    std::atan2(equatorialZ, std::hypot(equatorialX, equatorialY));
  const double hourAngle =
    greenwichMeanSiderealTime(decimalYear) +
    location.longitudeRadians -
    rightAscension;
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

double phaseAngleDegrees(double heliocentricDistance, double geocentricDistance, double sunDistance) {
  const double denominator =
    std::max(0.000001, 2.0 * heliocentricDistance * geocentricDistance);
  const double cosine = clamp(
    (
      heliocentricDistance * heliocentricDistance +
      geocentricDistance * geocentricDistance -
      sunDistance * sunDistance
    ) / denominator,
    -1.0,
    1.0
  );
  return std::acos(cosine) / kDegToRad;
}

float apparentMagnitude(
  SolarSystemBody body,
  double heliocentricDistance,
  double geocentricDistance,
  double phaseDegrees,
  double ringCorrection
) {
  const double distanceTerm =
    5.0 * std::log10(std::max(0.000001, heliocentricDistance * geocentricDistance));
  switch (body) {
    case SolarSystemBody::Sun:
      return -26.74f;
    case SolarSystemBody::Mercury:
      return static_cast<float>(
        -0.36 + distanceTerm +
        0.027 * phaseDegrees +
        2.2e-13 * std::pow(phaseDegrees, 6.0)
      );
    case SolarSystemBody::Venus:
      return static_cast<float>(
        -4.34 + distanceTerm +
        0.013 * phaseDegrees +
        4.2e-7 * std::pow(phaseDegrees, 3.0)
      );
    case SolarSystemBody::Mars:
      return static_cast<float>(-1.51 + distanceTerm + 0.016 * phaseDegrees);
    case SolarSystemBody::Jupiter:
      return static_cast<float>(-9.25 + distanceTerm + 0.014 * phaseDegrees);
    case SolarSystemBody::Saturn:
      return static_cast<float>(
        -9.0 + distanceTerm + 0.044 * phaseDegrees + ringCorrection
      );
  }
  return 0.0f;
}

double saturnRingMagnitude(Vec3d geocentric, double days) {
  const double longitude = std::atan2(geocentric.y, geocentric.x);
  const double latitude =
    std::atan2(geocentric.z, std::hypot(geocentric.x, geocentric.y));
  constexpr double ringInclination = 28.06 * kDegToRad;
  const double ascendingNode =
    radians(169.51 + 0.0000382 * days);
  const double ringTilt = std::asin(
    std::sin(latitude) * std::cos(ringInclination) -
    std::cos(latitude) * std::sin(ringInclination) *
      std::sin(longitude - ascendingNode)
  );
  const double sineTilt = std::sin(std::abs(ringTilt));
  return -2.6 * sineTilt + 1.2 * sineTilt * sineTilt;
}

double bodyDiameterKilometers(SolarSystemBody body) {
  switch (body) {
    case SolarSystemBody::Sun:
      return 1392700.0;
    case SolarSystemBody::Mercury:
      return 4879.4;
    case SolarSystemBody::Venus:
      return 12103.6;
    case SolarSystemBody::Mars:
      return 6779.0;
    case SolarSystemBody::Jupiter:
      return 139820.0;
    case SolarSystemBody::Saturn:
      return 116460.0;
  }
  return 1.0;
}

std::array<float, 3> bodyColor(SolarSystemBody body) {
  switch (body) {
    case SolarSystemBody::Sun:
      return {1.0f, 0.82f, 0.48f};
    case SolarSystemBody::Mercury:
      return {0.82f, 0.79f, 0.72f};
    case SolarSystemBody::Venus:
      return {1.0f, 0.92f, 0.72f};
    case SolarSystemBody::Mars:
      return {1.0f, 0.43f, 0.24f};
    case SolarSystemBody::Jupiter:
      return {1.0f, 0.78f, 0.58f};
    case SolarSystemBody::Saturn:
      return {1.0f, 0.74f, 0.46f};
  }
  return {1.0f, 1.0f, 1.0f};
}

} // namespace

std::array<SolarSystemBodyState, 6> solarSystemState(
  double decimalYear,
  const Location& location
) {
  const double days =
    julianDayFromDecimalYear(decimalYear) - kSchlyterEpochJulianDay;
  const OrbitalPosition sunOrbit = orbitalPosition(sunElements(days));
  const Vec3d sunGeocentric{
    sunOrbit.radius * std::cos(sunOrbit.longitude),
    sunOrbit.radius * std::sin(sunOrbit.longitude),
    0.0,
  };
  const OrbitalPosition jupiter =
    orbitalPosition(planetElements(SolarSystemBody::Jupiter, days));
  const OrbitalPosition saturn =
    orbitalPosition(planetElements(SolarSystemBody::Saturn, days));
  constexpr std::array<SolarSystemBody, 6> bodies{
    SolarSystemBody::Sun,
    SolarSystemBody::Mercury,
    SolarSystemBody::Venus,
    SolarSystemBody::Mars,
    SolarSystemBody::Jupiter,
    SolarSystemBody::Saturn,
  };
  std::array<SolarSystemBodyState, bodies.size()> states{};

  for (std::size_t index = 0; index < bodies.size(); ++index) {
    const SolarSystemBody body = bodies[index];
    Vec3d geocentric = sunGeocentric;
    double heliocentricDistance = sunOrbit.radius;
    double geocentricDistance = sunOrbit.radius;
    double phaseDegrees = 0.0;
    double ringCorrection = 0.0;

    if (body != SolarSystemBody::Sun) {
      OrbitalPosition planet = orbitalPosition(planetElements(body, days));
      applyOuterPlanetPerturbations(
        body,
        jupiter.meanAnomaly,
        saturn.meanAnomaly,
        planet
      );
      geocentric = {
        planet.position.x + sunGeocentric.x,
        planet.position.y + sunGeocentric.y,
        planet.position.z,
      };
      heliocentricDistance = planet.radius;
      geocentricDistance = std::sqrt(
        geocentric.x * geocentric.x +
        geocentric.y * geocentric.y +
        geocentric.z * geocentric.z
      );
      phaseDegrees = phaseAngleDegrees(
        heliocentricDistance,
        geocentricDistance,
        sunOrbit.radius
      );
      if (body == SolarSystemBody::Saturn) {
        ringCorrection = saturnRingMagnitude(geocentric, days);
      }
    }

    const double angularDiameter =
      bodyDiameterKilometers(body) /
      (std::max(0.000001, geocentricDistance) * kAstronomicalUnitKilometers);
    states[index] = {
      body,
      localDirection(geocentric, days, decimalYear, location),
      apparentMagnitude(
        body,
        heliocentricDistance,
        geocentricDistance,
        phaseDegrees,
        ringCorrection
      ),
      static_cast<float>(angularDiameter),
      bodyColor(body),
    };
  }

  return states;
}

} // namespace skyrewind
