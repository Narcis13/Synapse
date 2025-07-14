// Marketing component types

export interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  preview?: React.ReactNode;
  color: string;
}

export interface CompetitorFeature {
  feature: string;
  synapse: boolean;
  competitor1: boolean;
  competitor2: boolean;
  competitor3: boolean;
}

export interface FeatureHighlight {
  icon: React.ReactNode;
  title: string;
  description: string;
}