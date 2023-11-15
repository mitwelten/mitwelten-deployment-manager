/* istanbul ignore file */

/**
 * A device deployed in the field, commondly collecting and/or processing data
 */
export type Node = {
  node_id?: number;
  /** Identifyer, a.k.a _Node ID_, _Node Label_, or _Label_ */
  node_label: string;
  /** Desription of function */
  type: string;
  serial_number?: string;
  description?: string;
  deployment_count: number;
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

/**
* Node Type Guard
* @param node Object to check if is of Node type
* @returns boolean
*/
export function isNode(node: unknown): node is Node {
if (node === null || node === undefined) return false;
return (node as Node).node_label !== undefined
    && (node as Node).type !== undefined;
}
