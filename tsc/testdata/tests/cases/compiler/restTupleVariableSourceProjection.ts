// @strict: true
// @noEmit: true
// @noTypesAndSymbols: true

declare let targetWithTrailingRest: (...args: [number, boolean, string] | [number, boolean, boolean]) => void;
declare let sourceWithTrailingRest: (...args: [number, ...boolean[]]) => void;

targetWithTrailingRest = sourceWithTrailingRest; // error

declare let incompatibleTargetWithLeadingRest: (...args: [number, boolean, string]) => void;
declare let compatibleTargetWithLeadingRest: (...args: [number, number, boolean]) => void;
declare let sourceWithLeadingRest: (...args: [...number[], boolean]) => void;

incompatibleTargetWithLeadingRest = sourceWithLeadingRest; // error
compatibleTargetWithLeadingRest = sourceWithLeadingRest; // ok
