export interface TypePatternCard {
  type_id: string;
  subject: string;
  unit: string | null;
  topic: string | null;
  type_name: string;
  stem_structure: unknown | null;
  cognitive_skill: string | null;
  common_mistakes: unknown | null;
  variation_axes: unknown | null;
  difficulty_factors: unknown | null;
  validation_rules: unknown | null;
  copyright_safety_rules: unknown | null;
  created_at: string;
  updated_at: string;
}
