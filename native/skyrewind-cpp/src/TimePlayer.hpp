#pragma once

#include <string>

namespace skyrewind {

struct TimePlayerState {
  double currentYear = 2022.28;
  double speedSecondsPerSecond = -(80.0 * 60.0);
  double sampledYearsPerSecond = 0.0;
  double rateDirection = -1.0;
  double customYearsPerSecond = 0.0;
  double customDaysPerSecond = 0.0;
  double customHoursPerSecond = 1.0;
  double customMinutesPerSecond = 20.0;
  double customSecondsPerSecond = 0.0;
  bool playing = false;
  bool showWindow = true;
};

double timePartsToSeconds(double years, double days, double hours, double minutes, double seconds);
double customTimePlayerRateSeconds(const TimePlayerState& player);
void sanitizeTimePlayer(TimePlayerState& player);
void syncTimePlayerSpeed(TimePlayerState& player);
void updateTimePlayer(TimePlayerState& player, double deltaSeconds);
std::string formatDecimalYear(double decimalYear);
std::string formatTimeRate(double secondsPerSecond);
std::string formatYearRate(double yearsPerSecond);

} // namespace skyrewind
