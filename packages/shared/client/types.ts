import {
  BreakpointId,
  ContentType,
  Result as EvaluationResult,
  EventHandlerType,
  ExecutionPoint,
  FocusWindowRequest,
  FrameId,
  FunctionMatch,
  KeyboardEvent,
  loadedRegions as LoadedRegions,
  Location,
  MappedLocation,
  Message,
  MouseEvent,
  NavigationEvent,
  ObjectId,
  ObjectPreviewLevel,
  PauseData,
  PauseId,
  PointDescription,
  PointLimits,
  PointRange,
  PointSelector,
  getPointsBoundingTimeResult as PointsBoundingTime,
  RecordingId,
  Result,
  RunEvaluationResult,
  SameLineSourceLocations,
  ScopeId,
  SearchSourceContentsMatch,
  SessionId,
  newSource as Source,
  SourceId,
  SourceLocation,
  TimeStampedPoint,
  TimeStampedPointRange,
  VariableMapping,
  createPauseResult,
  getAllFramesResult,
  getExceptionValueResult,
  getScopeResult,
  getSourceOutlineResult,
  getTopFrameResult,
  keyboardEvents,
  navigationEvents,
  repaintGraphicsResult,
} from "@replayio/protocol";

export type LogEntry = {
  args: any[];
  isAsync: boolean;
  method: string;
  result: any;
};

export type ColumnHits = {
  hits: number;
  location: SourceLocation;
};

export type LineHitCounts = {
  count: number;
  firstBreakableColumnIndex: number;
};
export type LineNumberToHitCountMap = Map<number, LineHitCounts>;

export type Events = {
  keyboardEvents: KeyboardEvent[];
  mouseEvents: MouseEvent[];
  navigationEvents: NavigationEvent[];
};

export const POINT_BEHAVIOR_ENABLED = "enabled";
export const POINT_BEHAVIOR_DISABLED = "disabled";
export const POINT_BEHAVIOR_DISABLED_TEMPORARILY = "disabled-temporarily";

export type POINT_BEHAVIOR =
  | typeof POINT_BEHAVIOR_ENABLED
  | typeof POINT_BEHAVIOR_DISABLED
  | typeof POINT_BEHAVIOR_DISABLED_TEMPORARILY;

export type PartialUser = {
  id: string;
  name: string | null;
  picture: string | null;
};

export type PointKey = string;
export type Badge = "blue" | "green" | "orange" | "purple" | "unicorn" | "yellow";

// Points are saved to GraphQL.
// They can be viewed by all users who have access to a recording.
// They can only be edited or deleted by the user who created them.
//
// Note that Points are only saved to GraphQL for authenticated users.
// They are also saved to IndexedDB to support unauthenticated users.
export type Point = {
  // This a client-assigned value is used as the primary key on the server.
  // It exists to simplify equality checks and PointBehavior mapping.
  key: PointKey;

  // These attributes are fixed after Point creation
  createdAt: Date;
  location: Location;
  recordingId: RecordingId;
  user: PartialUser | null;

  // These attributes are editable, although only by the Point's owner
  badge: Badge | null;
  condition: string | null;
  content: string;
};

// Point behaviors are saved to IndexedDB.
// (They are remembered between sessions but are not shared with other users.)
// They control a given point behaves locally (e.g. does it log to the console)
// Behaviors are modifiable by everyone (regardless of who created a point).
export type PointBehavior = {
  key: PointKey;
  shouldBreak: POINT_BEHAVIOR;
  shouldLog: POINT_BEHAVIOR;
};

export type ReplayClientEvents = "loadedRegionsChange";

export type HitPointStatus =
  | "complete"
  | "too-many-points-to-find"
  | "too-many-points-to-run-analysis"
  | "unknown-error";

export type HitPointsAndStatusTuple = [points: TimeStampedPoint[], status: HitPointStatus];
export interface SourceLocationRange {
  start: SourceLocation;
  end: SourceLocation;
}

export interface ReplayClientInterface {
  get loadedRegions(): LoadedRegions | null;
  addEventListener(type: ReplayClientEvents, handler: Function): void;
  breakpointAdded(location: Location, condition: string | null): Promise<BreakpointId[]>;
  breakpointRemoved(breakpointId: BreakpointId): Promise<void>;
  configure(sessionId: string): void;
  createPause(executionPoint: ExecutionPoint): Promise<createPauseResult>;
  evaluateExpression(
    pauseId: PauseId,
    expression: string,
    frameId: FrameId | null
  ): Promise<EvaluationResult>;
  findKeyboardEvents(onKeyboardEvents: (events: keyboardEvents) => void): Promise<void>;
  findMessages(focusRange: TimeStampedPointRange | null): Promise<{
    messages: Message[];
    overflow: boolean;
  }>;
  findNavigationEvents(onKeyboardEvents: (events: navigationEvents) => void): Promise<void>;
  findPoints(selector: PointSelector, limits?: PointLimits): Promise<PointDescription[]>;
  findSources(): Promise<Source[]>;
  getAllEventHandlerCounts(range: PointRange | null): Promise<Record<string, number>>;
  getAllFrames(pauseId: PauseId): Promise<getAllFramesResult>;
  getAnnotationKinds(): Promise<string[]>;
  getBreakpointPositions(
    sourceId: SourceId,
    range: SourceLocationRange | null
  ): Promise<SameLineSourceLocations[]>;
  getBuildId(): Promise<string>;
  getCorrespondingLocations(location: Location): Location[];
  getCorrespondingSourceIds(sourceId: SourceId): SourceId[];
  getEventCountForTypes(
    eventTypes: EventHandlerType[],
    focusRange: PointRange | null
  ): Promise<Record<string, number>>;
  getExceptionValue(pauseId: PauseId): Promise<getExceptionValueResult>;
  getFocusWindow(): Promise<TimeStampedPointRange>;
  getFrameSteps(pauseId: PauseId, frameId: FrameId): Promise<PointDescription[]>;
  getMappedLocation(location: Location): Promise<MappedLocation>;
  getObjectWithPreview(
    objectId: ObjectId,
    pauseId: PauseId,
    level?: ObjectPreviewLevel
  ): Promise<PauseData>;
  getObjectProperty(objectId: ObjectId, pauseId: PauseId, propertyName: string): Promise<Result>;
  getPointNearTime(time: number): Promise<TimeStampedPoint>;
  getPointsBoundingTime(time: number): Promise<PointsBoundingTime>;
  getPreferredLocation(locations: Location[]): Location | null;
  getRecordingId(): RecordingId | null;
  getScope(pauseId: PauseId, scopeId: ScopeId): Promise<getScopeResult>;
  getScopeMap(location: Location): Promise<VariableMapping[] | undefined>;
  getSessionEndpoint(sessionId: SessionId): Promise<TimeStampedPoint>;
  getSessionId(): SessionId | null;
  getSourceHitCounts(
    sourceId: SourceId,
    locationRange: SourceLocationRange,
    sourceLocations: SameLineSourceLocations[],
    focusRange: PointRange | null
  ): Promise<LineNumberToHitCountMap>;
  getSourceOutline(sourceId: SourceId): Promise<getSourceOutlineResult>;
  getTopFrame(pauseId: PauseId): Promise<getTopFrameResult>;
  initialize(recordingId: string, accessToken: string | null): Promise<SessionId>;
  isOriginalSource(sourceId: SourceId): boolean;
  isPrettyPrintedSource(sourceId: SourceId): boolean;
  mapExpressionToGeneratedScope(expression: string, location: Location): Promise<string>;
  requestFocusRange(range: FocusWindowRequest): Promise<TimeStampedPointRange>;
  removeEventListener(type: ReplayClientEvents, handler: Function): void;
  repaintGraphics(pauseId: PauseId): Promise<repaintGraphicsResult>;
  runEvaluation(
    opts: {
      selector: PointSelector;
      expression: string;
      frameIndex?: number;
      fullPropertyPreview?: boolean;
      limits?: PointLimits;
    },
    onResults: (results: RunEvaluationResult[]) => void
  ): Promise<void>;
  searchFunctions(
    opts: {
      query: string;
      sourceIds?: string[];
    },
    onMatches: (matches: FunctionMatch[]) => void
  ): Promise<void>;
  searchSources(
    opts: {
      limit?: number;
      query: string;
      sourceIds?: string[];
    },
    onMatches: (matches: SearchSourceContentsMatch[], didOverflow: boolean) => void
  ): Promise<void>;
  streamSourceContents(
    sourceId: SourceId,
    onSourceContentsInfo: ({
      codeUnitCount,
      contentType,
      lineCount,
      sourceId,
    }: {
      codeUnitCount: number;
      contentType: ContentType;
      lineCount: number;
      sourceId: SourceId;
    }) => void,
    onSourceContentsChunk: ({ chunk, sourceId }: { chunk: string; sourceId: SourceId }) => void
  ): Promise<void>;
  waitForLoadedSources(): Promise<void>;
  waitForTimeToBeLoaded(time: number): Promise<void>;
}
