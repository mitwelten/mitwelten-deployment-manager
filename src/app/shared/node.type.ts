/* istanbul ignore file */

/**
 * A device deployed in the field, commondly collecting and/or processing data
 */
export type Node = {
    node_id?: number | null;
    /** Identifyer, a.k.a _Node ID_, _Node Label_, or _Label_ */
    node_label: string;
    /** Desription of function */
    type: string;
    // location: Location;
    serial_number?: string | null;
    description?: string | null;
    /** Hardware platform */
    platform?: string | null;
    connectivity?: string | null;
    power?: string | null;
    hardware_version?: string | null;
    software_version?: string | null;
    firmware_version?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

