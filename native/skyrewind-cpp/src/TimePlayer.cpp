#include "TimePlayer.hpp"

#include <algorithm>
#include <cmath>
#include <iomanip>
#include <sstream>

namespace skyrewind {
namespace {

constexpr double kSecondsPerMinute = 60.0;
constexpr double kSecondsPerHour = kSecondsPerMinute * 60.0;
constexpr double kSecondsPerDay = kSecondsPerHour * 24.0;
constexpr double kSecondsPerMeanYear = kSecondsPerDay * 365.2425;
constexpr double kMinimumYear = -50000.0;
constexpr double kMaximumYear = 50000.0;

double nonNegative(double value) {
  return std::max(0.0, value);
}

std::string trimTrailingZeros(std::string value) {
  while (!value.empty() && value.back() == '0') {
    value.pop_back();
  }
  if (!value.empty() && value.back() == '.') {
    value.pop_back();
  }
  return value.empty() ? "0" : value;
}

std::string fixedValue(double value, int precision) {
  std::ostringstream out;
  out << std::fixed << std::setprecision(precision) << value;
  return trimTrailingZeros(out.str());
}

} // namespace

double timePartsToSeconds(double years, double days, double hours, double minutes, double seconds) {
  return nonNegative(years) * kSecondsPerMeanYear +
    nonNegative(days) * kSecondsPerDay +
    nonNegative(hours) * kSecondsPerHour +
    nonNegative(minutes) * kSecondsPerMinute +
    nonNegative(seconds);
}

double customTimePlayerRateSeconds(const TimePlayerState& player) {
  return timePartsToSeconds(
    player.customYearsPerSecond,
    player.customDaysPerSecond,
    player.customHoursPerSecond,
    player.customMinutesPerSecond,
    player.customSecondsPerSecond
  );
}

void sanitizeTimePlayer(TimePlayerState& player) {
  player.currentYear = std::clamp(player.currentYear, kMinimumYear, kMaximumYear);
  if (player.rateDirection < 0.0) {
    player.rateDirection = -1.0;
  } else if (player.rateDirection > 0.0) {
    player.rateDirection = 1.0;
  }
  player.customYearsPerSecond = nonNegative(player.customYearsPerSecond);
  player.customDaysPerSecond = nonNegative(player.customDaysPerSecond);
  player.customHoursPerSecond = nonNegative(player.customHoursPerSecond);
  player.customMinutesPerSecond = nonNegative(player.customMinutesPerSecond);
  player.customSecondsPerSecond = nonNegative(player.customSecondsPerSecond);
}

void syncTimePlayerSpeed(TimePlayerState& player) {
  sanitizeTimePlayer(player);
  player.speedSecondsPerSecond = player.rateDirection * customTimePlayerRateSeconds(player);
}

void updateTimePlayer(TimePlayerState& player, double deltaSeconds) {
  syncTimePlayerSpeed(player);
  const double safeDeltaSeconds = std::max(0.0, deltaSeconds);
  if (!player.playing) {
    player.sampledYearsPerSecond = 0.0;
    return;
  }

  const double previousYear = player.currentYear;
  player.currentYear += player.speedSecondsPerSecond * safeDeltaSeconds / kSecondsPerMeanYear;
  player.currentYear = std::clamp(player.currentYear, kMinimumYear, kMaximumYear);
  player.sampledYearsPerSecond = safeDeltaSeconds > 0.0
    ? (player.currentYear - previousYear) / safeDeltaSeconds
    : 0.0;
}

std::string formatDecimalYear(double decimalYear) {
  std::ostringstream out;
  out << std::fixed << std::setprecision(3);
  if (decimalYear >= 1.0) {
    out << decimalYear << " CE";
    return out.str();
  }

  out << (1.0 - decimalYear) << " BCE";
  return out.str();
}

std::string formatTimeRate(double secondsPerSecond) {
  const char* sign = secondsPerSecond < 0.0 ? "- " : "+ ";
  double remaining = std::abs(secondsPerSecond);
  const double years = std::floor(remaining / kSecondsPerMeanYear);
  if (years >= 1.0) {
    return std::string(sign) + fixedValue(remaining / kSecondsPerMeanYear, 3) + " yr/s";
  }

  const double days = std::floor(remaining / kSecondsPerDay);
  remaining -= days * kSecondsPerDay;
  const double hours = std::floor(remaining / kSecondsPerHour);
  remaining -= hours * kSecondsPerHour;
  const double minutes = std::floor(remaining / kSecondsPerMinute);
  remaining -= minutes * kSecondsPerMinute;

  std::ostringstream out;
  out << sign;
  bool wrote = false;
  if (days > 0.0) {
    out << static_cast<int>(days) << "d";
    wrote = true;
  }
  if (hours > 0.0) {
    out << (wrote ? " " : "") << static_cast<int>(hours) << "h";
    wrote = true;
  }
  if (minutes > 0.0) {
    out << (wrote ? " " : "") << static_cast<int>(minutes) << "m";
    wrote = true;
  }
  if (!wrote || remaining > 0.001) {
    out << (wrote ? " " : "") << fixedValue(remaining, 2) << "s";
  }
  out << "/s";
  return out.str();
}

std::string formatYearRate(double yearsPerSecond) {
  const char* sign = yearsPerSecond < 0.0 ? "- " : "+ ";
  const double magnitude = std::abs(yearsPerSecond);
  const int precision = magnitude >= 1.0 ? 3 : 6;
  return std::string(sign) + fixedValue(magnitude, precision) + " yr/s";
}

} // namespace skyrewind
