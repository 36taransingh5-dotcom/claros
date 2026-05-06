export interface VisionResult {
  part_name: string;
  part_category: string;
  application_domain: string;
  specifications: Record<string, string>;
  confidence: number;
  visible_markings: string[];
  suggested_search_terms: string[];
  description: string;
  condition: string;
}

export interface PartMatch {
  id: string;
  part_number: string;
  name: string;
  category: string;
  description: string;
  manufacturer: string;
  application_domain: string;
  specifications: Record<string, string>;
  oem_numbers: string[];
  score: number;
}

export interface CompatibilityEntry {
  make: string;
  model: string;
  year_from: number;
  year_to: number;
  engine_type: string;
}

export interface IdentifyResponse {
  query_id: string;
  vision: VisionResult;
  matches: PartMatch[];
  top_compatibility: CompatibilityEntry[];
}

export interface HistoryItem {
  id: string;
  image_path: string | null;
  input_type: 'image' | 'text';
  text_input: string | null;
  created_at: string;
  vision: VisionResult | null;
  matches: PartMatch[];
}
