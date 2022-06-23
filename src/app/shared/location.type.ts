/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Point } from './point.type';

/**
 * A location record, describing metadata of a coordinate
 */
export type Location = {
    id?: number;
    location: Point;
    type?: string;
    name?: string;
    description?: string;
};

