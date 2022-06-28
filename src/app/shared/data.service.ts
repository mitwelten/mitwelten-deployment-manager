import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { Deployment } from './deployment.type';
import { Node } from './node.type';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = environment.apiUrl;

  constructor(public readonly http: HttpClient) {}

  public login(): Observable<boolean> {
    return this.http.get<{authenticated: boolean}>(`${this.apiUrl}/login`).pipe(
      map(response => response.authenticated)
    );
  }

  public listNodes(): Observable<Array<Node>> {
    return this.http.get<Array<Node>>(`${this.apiUrl}/nodes`);
  }

  public listDeployments(): Observable<Array<Deployment>> {
    return this.http.get<Array<Deployment>>(`${this.apiUrl}/deployments`);
  }

  public getNodeById(id: number): Observable<Node> {
    return this.http.get<Node>(`${this.apiUrl}/node/${id}`);
  }

  public deleteNode(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/node/${id}`);
  }

  public getDeploymentById(id: number): Observable<Deployment> {
    return this.http.get<Deployment>(`${this.apiUrl}/deployment/${id}`);
  }

  public putDeployment(deployment: any) {
    return this.http.put(`${this.apiUrl}/deployments`, deployment);
  }

  public deleteDeployment(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/deployment/${id}`);
  }

  public putNode(node: Partial<Node>): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/nodes`, node);
  }

  public isDeploymentOverlapping(deployment: any) {
    return this.http.put<boolean>(`${this.apiUrl}/validate/deployment`, deployment);
  }

  public isNodeUnique(node: Partial<Node>) {
    return this.http.put<boolean>(`${this.apiUrl}/validate/node`, node);
  }

  public getNodeTypeOptions(searchTerm: string) {
    return this.http.get<string[]>(`${this.apiUrl}/node/type_options/${searchTerm}`);
  }

  public getNodePlatformOptions(searchTerm: string) {
    return this.http.get<string[]>(`${this.apiUrl}/node/platform_options/${searchTerm}`);
  }

  public getNodeConnectivityOptions(searchTerm: string) {
    return this.http.get<string[]>(`${this.apiUrl}/node/connectivity_options/${searchTerm}`);
  }

  public getNodePowerOptions(searchTerm: string) {
    return this.http.get<string[]>(`${this.apiUrl}/node/power_options/${searchTerm}`);
  }

}
