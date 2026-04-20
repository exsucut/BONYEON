import { monotonicFactory } from "ulid";

const ulidFactory = monotonicFactory();

export const newId = (): string => ulidFactory();
