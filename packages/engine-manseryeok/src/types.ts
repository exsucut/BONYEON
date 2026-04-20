import type { Branch } from "./constants/branches.js";
import type { HiddenStem } from "./constants/hidden-stems.js";
import type { Stem } from "./constants/stems.js";

export type JasiConvention = "unified" | "split" | "offset30";
export type CalendarType = "solar" | "lunar";

export interface ManseryeokInput {
  readonly date: {
    readonly year: number;
    readonly month: number; // 1..12
    readonly day: number; // 1..31
  };
  readonly time: {
    readonly hour: number; // 0..23
    readonly minute: number; // 0..59
  } | null;
  readonly calendarType: CalendarType;
  readonly lunarLeap?: boolean;
  readonly location: {
    readonly longitude: number;
    readonly latitude: number;
    readonly cityName?: string;
    readonly timezoneOverride?: number; // minutes, override standard KST
  };
  readonly conventions: {
    readonly jasi: JasiConvention;
    readonly yearBoundary: "ipchun";
    readonly useTrueSolarTime: boolean;
  };
}

export interface Pillar {
  readonly stem: Stem;
  readonly branch: Branch;
}

export interface HiddenStemsByPillar {
  readonly year: readonly HiddenStem[];
  readonly month: readonly HiddenStem[];
  readonly day: readonly HiddenStem[];
  readonly hour: readonly HiddenStem[] | null;
}

export interface ManseryeokOutput {
  readonly pillars: {
    readonly year: Pillar;
    readonly month: Pillar;
    readonly day: Pillar;
    readonly hour: Pillar | null;
  };
  readonly hiddenStems: HiddenStemsByPillar;
  readonly calendar: {
    readonly solar: string; // ISO 8601 with +09:00
    readonly lunar: {
      readonly year: number;
      readonly month: number;
      readonly day: number;
      readonly isLeap: boolean;
    } | null; // v0.1: null until lunar conversion implemented
    readonly dayOfWeek: number; // 0=Sunday
  };
  readonly kongmang: {
    readonly byDay: readonly [Branch, Branch];
    readonly byYear: readonly [Branch, Branch];
  };
  readonly napeum: {
    readonly year: string;
    readonly month: string;
    readonly day: string;
    readonly hour: string | null;
  };
  readonly trace: ManseryeokTrace;
}

export interface ManseryeokTrace {
  readonly timeProcessing: {
    readonly userInput: string;
    readonly afterCalendarConversion: string;
    readonly afterTimezoneNormalization: string;
    readonly afterDSTRollback: string;
    readonly trueSolarTime: string;
  };
  readonly timezone: {
    readonly meridian: number;
    readonly offsetMinutes: number;
    readonly periodName: string;
  };
  readonly dst: {
    readonly applied: boolean;
    readonly period?: {
      readonly name: string;
      readonly start: string;
      readonly end: string;
      readonly offsetMinutes: number;
    };
  };
  readonly trueSolarCorrection: {
    readonly enabled: boolean;
    readonly longitudeCorrectionMinutes: number;
    readonly equationOfTimeMinutes: number;
    readonly totalCorrectionMinutes: number;
  };
  readonly solarTerms: {
    readonly previousMajor: { readonly name: string; readonly utc: string };
    readonly nextMajor: { readonly name: string; readonly utc: string };
    readonly solarLongitudeAtBirth: number;
    readonly dataSource: "KASI" | "Meeus";
  };
  readonly pillarDecisions: {
    readonly year: {
      readonly ipchunUtc: string;
      readonly birthRelativeToIpchun: "before" | "after";
      readonly effectiveYear: number;
    };
    readonly month: {
      readonly governingTermName: string;
      readonly wuhutunRule: string;
    };
    readonly day: {
      readonly jdn: number;
      readonly referenceAnchor: { readonly date: string; readonly pillar: string };
      readonly jasiAdjustment: "none" | "rolled-forward" | "kept";
    };
    readonly hour: {
      readonly jasiConvention: JasiConvention;
      readonly wusodunRule: string;
    } | null;
  };
  readonly warnings: readonly string[];
}
