/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Location } from './location.type';
import type { Type } from './type.type';

/**
 * A device deployed in the field, commondly collecting and/or processing data
 */
export type Node = {
    node_id?: number;
    /** Identifyer, a.k.a _Node ID_, _Node Label_, or _Label_ */
    node_label: string;
    /** Desription of function */
    type: Type;
    // location: Location;
    serial_number?: string;
    description?: string;
    /** Hardware platform */
    platform?: string;
    connectivity?: string;
    power?: string;
    hardware_version?: string;
    software_version?: string;
    firmware_version?: string;
    created_at?: string;
    updated_at?: string;
};

