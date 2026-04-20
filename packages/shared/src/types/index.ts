export type EngineId =
  | "manseryeok"
  | "ziweidoushu"
  | "goldschneider"
  | "mbti"
  | "enneagram";

export type Gender = "male" | "female" | "unspecified";

export type CalendarType = "solar" | "lunar_regular" | "lunar_leap";

export type SolarTimeMode = "true_solar" | "standard";

export type JasiPolicy = "unified" | "split" | "offset30";

export interface EngineResult<TOutput = unknown, TTrace = unknown> {
  readonly id: string;
  readonly profileId: string;
  readonly engineId: EngineId;
  readonly engineVersion: string;
  readonly inputHash: string;
  readonly output: TOutput;
  readonly trace?: TTrace;
  readonly computedAt: Date;
}

export interface Engine<Input, Output> {
  readonly id: EngineId;
  readonly schemaVersion: string;
  compute(input: Input): Output;
}
