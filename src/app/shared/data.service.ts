import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Deployment } from './deployment.type';
import { Node } from './node.type';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(public readonly http: HttpClient) {}

    /**
     * List Nodes
     * List all nodes
     *
     * This is a temporary, hacky, but working implementation. It becomes obvious
     * that the database schema requires an abstraction of `deployment`.
     * @param from
     * @param to
     * @returns Node Successful Response
     * @throws ApiError
     */
    public listNodes(
        from?: string,
        to?: string,
    ): Observable<Array<Node>> {
        return this.http.get<Array<Node>>('http://localhost:8000/nodes', {});
    }

    public listDeployments(
        from?: string,
        to?: string,
    ): Observable<Array<Deployment>> {
        return this.http.get<Array<Deployment>>('http://localhost:8000/deployments', {});
    }

    public getNodeById(id: number): Observable<Node> {
      return this.http.get<Node>(`http://localhost:8000/node/${id}`, {});
    }

    public deleteNode(id: number): Observable<boolean> {
      return this.http.delete<boolean>(`http://localhost:8000/node/${id}`);
    }

    public getDeploymentById(id: number): Observable<Deployment> {
      return this.http.get<Deployment>(`http://localhost:8000/deployment/${id}`, {});
    }

    public putDeployment(deployment: any) {
      return this.http.put(`http://localhost:8000/deployments`, deployment, { });
    }

    public deleteDeployment(id: number): Observable<boolean> {
      return this.http.delete<boolean>(`http://localhost:8000/deployment/${id}`);
    }


    public putNode(node: Partial<Node>): Observable<number> {
      return this.http.put<number>(`http://localhost:8000/nodes`, node, { });
    }

    public isDeploymentOverlapping(deployment: any) {
      return this.http.put<boolean>(`http://localhost:8000/validate/deployment`, deployment, {});
    }

    public isNodeUnique(node: Partial<Node>) {
      return this.http.put<boolean>(`http://localhost:8000/validate/node`, node, {});
    }

    public getNodeTypeOptions(searchTerm: string) {
      return this.http.get<string[]>(`http://localhost:8000/node/type_options/${searchTerm}`);
    }

    public getNodePlatformOptions(searchTerm: string) {
      return this.http.get<string[]>(`http://localhost:8000/node/platform_options/${searchTerm}`);
    }

    public getNodeConnectivityOptions(searchTerm: string) {
      return this.http.get<string[]>(`http://localhost:8000/node/connectivity_options/${searchTerm}`);
    }

    public getNodePowerOptions(searchTerm: string) {
      return this.http.get<string[]>(`http://localhost:8000/node/power_options/${searchTerm}`);
    }

}
