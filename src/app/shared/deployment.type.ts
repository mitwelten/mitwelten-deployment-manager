/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Location } from './location.type';
import type { Node } from './node.type';

export type TimeRange = {
  start?: string;
  end?: string;
}

export type Deployment = {
    deployment_id?: number;
    node_id: number;
    location_id: number;
    period: TimeRange;
    node: Node;
    location: Location
};

