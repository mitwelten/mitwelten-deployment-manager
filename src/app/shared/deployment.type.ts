/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { CoordinatePoint } from './coordinate-point.type';
import { isNode, type Node } from './node.type';
import type { Tag } from './tag.type';

export type TimeRange = {
  start?: string;
  end?: string;
}

export type Deployment = {
    deployment_id?: number;
    node_id: number;
    period: TimeRange;
    node: Node;
    location: CoordinatePoint;
    description?: string;
    tags?: Tag[];
};

/**
* Deployment Type Guard
* @param deployment Object to check if is of Deployment type
* @returns boolean
*/
export function isDeployment(deployment: unknown): deployment is Deployment {
  if (deployment === null || deployment === undefined) return false;
  return (deployment as Deployment).deployment_id !== undefined
      && (deployment as Deployment).node_id !== undefined
      && (deployment as Deployment).period !== undefined
      && (deployment as Deployment).node !== undefined
      && isNode((deployment as Deployment).node)
      && (deployment as Deployment).location !== undefined
      ;
}

export type UpsertDeployment = {
  deployment_id: number | null;
  node_id: number;
  period: TimeRange;
  location: CoordinatePoint;
  description: string | null;
  tags?: string[];
};

export type DeploymentFormValue = {
  deployment_id: number | null;
  node_id: number;
  period_start: Date | null;
  period_end: Date | null;
  lat: number;
  lon: number;
  description: string | null;
};

/**
 * Maps a partial DeploymentFormValue object to an UpsertDeployment object.
 * @param value - The partial DeploymentFormValue object to map.
 * @returns The mapped UpsertDeployment object.
 */
export function mapDeploymentFromValue(value: Partial<DeploymentFormValue>, tags?: string[]): UpsertDeployment {
  const deployment: UpsertDeployment = {
    deployment_id: value.deployment_id ?? null,
    node_id: value.node_id!,
    period: {
      start: value.period_start?.toISOString(),
      end: value.period_end?.toISOString()
    },
    location: {
      lat: value.lat!,
      lon: value.lon!
    },
    description: value.description ?? null,
    tags: tags
  };
  return deployment;
}
