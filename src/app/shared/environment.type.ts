import { CoordinatePoint } from "./coordinate-point.type";

export interface Environment {
  environment_id?: number;
  location: Partial<CoordinatePoint>;
  timestamp: string;
  attribute_01: number;
  attribute_02: number;
  attribute_03: number;
  attribute_04: number;
  attribute_05: number;
  attribute_06: number;
  attribute_07: number;
  attribute_08: number;
  attribute_09: number;
  attribute_10: number;
  created_at?: string;
  updated_at?: string;
  distance?: number;
}
