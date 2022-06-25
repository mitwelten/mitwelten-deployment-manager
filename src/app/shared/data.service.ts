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
}
