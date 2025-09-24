export interface SessionResult {
  position: number;
  driver_number: number;
  number_of_laps: number;
  points: number;
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  duration: number;
  gap_to_leader: number;
  meeting_key: number;
  session_key: number;
}
