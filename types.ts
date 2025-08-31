
export interface KeyExperience {
  rawTruth: string;
  corporateFraming: string;
  metaCommentary: string;
}

export interface CorporateNarrative {
  summary: string;
  keyExperienceBreakdown: KeyExperience[];
}

export interface StrategicAnalysis {
  oliversPerspective: string;
  stevesPerspective: string;
}

export interface NarrativeOutput {
  corporateNarrative: CorporateNarrative;
  strategicAnalysis: StrategicAnalysis;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
}
