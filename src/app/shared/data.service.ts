import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { Deployment } from './deployment.type';
import { Node } from './node.type';

import { environment } from 'src/environments/environment';
import { Tag } from './tag.type';

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

  public listDeployments(node_id?: number): Observable<Array<Deployment>> {
    const queryParams = node_id !== undefined ? `?node_id=${node_id}` : '';
    return this.http.get<Array<Deployment>>(`${this.apiUrl}/deployments${queryParams}`);
  }

  public listTags(deployment_id?: number): Observable<Array<Tag>> {
    const queryParams = deployment_id !== undefined ? `?deployment_id=${deployment_id}` : '';
    return this.http.get<Array<Tag>>(`${this.apiUrl}/tags${queryParams}`);
  }

  public listTagStats(): Observable<Array<Tag>> {
    return this.http.get<Array<Tag>>(`${this.apiUrl}/tags_stats`);
  }

  public putTag(tag: Partial<Tag>): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/tags`, tag);
  }

  public deleteTag(tag_id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/tag/${tag_id}`);
  }

  public getNodeById(id: number): Observable<Node> {
    return this.http.get<Node>(`${this.apiUrl}/node/${id}`);
  }

  public getNodeByLabel(label: string): Observable<Node> {
    return this.http.get<Node>(`${this.apiUrl}/node?label=${label}`);
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

  public isTagUnique(tag: Partial<Tag>) {
    return this.http.put<boolean>(`${this.apiUrl}/validate/tag`, tag);
  }

  public getNodeTypeOptions(searchTerm: string) {
    const segment = searchTerm === '' ? '' : `/${searchTerm}`;
    return this.http.get<string[]>(`${this.apiUrl}/node/type_options${segment}`);
  }

  public getNodePlatformOptions(searchTerm: string) {
    const segment = searchTerm === '' ? '' : `/${searchTerm}`;
    return this.http.get<string[]>(`${this.apiUrl}/node/platform_options${segment}`);
  }

  public getNodeConnectivityOptions(searchTerm: string) {
    const segment = searchTerm === '' ? '' : `/${searchTerm}`;
    return this.http.get<string[]>(`${this.apiUrl}/node/connectivity_options${segment}`);
  }

  public getNodePowerOptions(searchTerm: string) {
    const segment = searchTerm === '' ? '' : `/${searchTerm}`;
    return this.http.get<string[]>(`${this.apiUrl}/node/power_options${segment}`);
  }

}
