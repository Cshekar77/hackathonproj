export type Language = 'English' | 'Hindi' | 'Kannada' | 'Telugu' | 'Tamil';

export interface RentalRequirements {
  budget: string;
  bhk: string;
  preferredLocations: string;
  amenities: string;
}

export interface TenantProfile {
  profession: string;
  familySize: string;
  pets: string;
  moveInDate: string;
}

export interface RentalReport {
  pitch: string;
  summary: string;
  advice: string;
  matchScore: number;
  scamRisk: 'Low' | 'Medium' | 'High';
  marketPrice: number;
  currentPrice: number;
  listingName: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
