/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CoordinatePoint } from './coordinate-point.type';

/**
 * A location record, describing metadata of a coordinate
 */
export type Location = {
    id?: number;
    location: CoordinatePoint;
    type?: string;
    name?: string;
    description?: string;
};

