/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Location } from './location.type';
import type { Type } from './type.type';

/**
 * A device deployed in the field, commondly collecting and/or processing data
 */
export type Node = {
    id?: number;
    /**
     * Identifyer, a.k.a _Node ID_, _Node Label_, or _Label_
     */
    name: string;
    location: Location;
    /**
     * Desription of function
     */
    type: Type;
    /**
     * Hardware platform
     */
    platform?: string;
    description?: string;
};

