/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { CoordinatePoint } from './coordinate-point.type';
import type { Node } from './node.type';

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
};

