export interface BingoPoint {
  rawTruth: string;
  corporateLie: string;
  metaCommentary: string;
}

export interface CorporateNarrative {
  summary: string;
  bingoPoints: BingoPoint[];
}

export interface StrategicAnalysis {
  oliversPerspective: string;
  stevesPerspective: string;
}

export interface NarrativeOutput {
  corporateNarrative: CorporateNarrative;
  strategicAnalysis: StrategicAnalysis;
}