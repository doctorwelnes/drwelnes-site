export interface WorkoutSlotAvailabilityLike {
  status: string;
  currentParticipants: number;
  maxParticipants: number;
  isBlockedByOverlap?: boolean;
}

export interface WorkoutSlotTimeLike extends WorkoutSlotAvailabilityLike {
  id: string;
  date: string | Date;
  startTime: string;
  endTime: string;
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function normalizeDateKey(date: string | Date) {
  return new Date(date).toISOString().slice(0, 10);
}

export function isTimeRangeOverlapping(
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
) {
  return (
    timeToMinutes(firstStart) < timeToMinutes(secondEnd) &&
    timeToMinutes(secondStart) < timeToMinutes(firstEnd)
  );
}

export function isWorkoutSlotFull(slot: WorkoutSlotAvailabilityLike) {
  return slot.currentParticipants >= slot.maxParticipants;
}

export function isWorkoutSlotUnavailable(slot: WorkoutSlotAvailabilityLike) {
  return slot.status === "FULL" || isWorkoutSlotFull(slot) || Boolean(slot.isBlockedByOverlap);
}

export function withWorkoutOverlapState<T extends WorkoutSlotTimeLike>(slots: T[]) {
  return slots.map((slot) => {
    const slotDateKey = normalizeDateKey(slot.date);
    const isBlockedByOverlap = slots.some((candidate) => {
      if (candidate.id === slot.id) return false;
      if (normalizeDateKey(candidate.date) !== slotDateKey) return false;
      if ((candidate.currentParticipants || 0) <= 0) return false;

      return isTimeRangeOverlapping(
        slot.startTime,
        slot.endTime,
        candidate.startTime,
        candidate.endTime,
      );
    });

    return {
      ...slot,
      isBlockedByOverlap,
    };
  });
}
