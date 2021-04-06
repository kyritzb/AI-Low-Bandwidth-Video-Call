import moment, { MomentInput } from "moment";

/**
 * Calculates the time in milliseconds between two moment times
 * @param {MomentInput} start the start time in moment format
 * @param {MomentInput} end the end time in moment format
 */
function calculateDuration(start: MomentInput, end: MomentInput): Number {
  var start_moment = moment.utc(start, "HH:mm:ss");
  var end_moment = moment.utc(end, "HH:mm:ss");
  // account for crossing over to midnight the next day
  if (end_moment.isBefore(start_moment)) end_moment.add(1, "day");
  // calculate the duration
  var duration = moment.duration(end_moment.diff(start_moment));
  return duration.asMilliseconds();
}

export { calculateDuration };
