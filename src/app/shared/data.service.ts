import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  nodes = [
    {
      id: 33,
      name: "8125-0324",
      location: {
        id: 26,
        location: {
          lat: 47.537170071,
          lon: 7.614982059
        },
        type: null,
        name: "Berri-Scheune (Bats)",
        description: "Hinter der Berri-Scheune Richtung St.Alban-Dyych (Bats)"
      },
      type: "Audio",
      platform: "AudioMoth",
      description: null
    },
    {
      id: 30,
      name: "4672-2602",
      location: {
        id: 32,
        location: {
          lat: 47.536054,
          lon: 7.614804
        },
        type: null,
        name: "Weide",
        description: "Weide"
      },
      type: "Audio",
      platform: "AudioMoth",
      description: null
    },
    {
      id: 24,
      name: "2061-6644",
      location: {
        id: 29,
        location: {
          lat: 47.534230119,
          lon: 7.614490083
        },
        type: null,
        name: "Lehmhaus",
        description: "Lehmhaus"
      },
      type: "Audio",
      platform: "AudioMoth",
      description: null
    },
    {
      id: 37,
      name: "7257-5673",
      location: {
        id: 28,
        location: {
          lat: 47.53607,
          lon: 7.61493
        },
        type: null,
        name: null,
        description: "on a tree at the meadow near the sheep and chicken shed"
      },
      type: "audiomoth",
      platform: null,
      description: "renamed from AM2"
    }
  ];

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
        return this.http.get<Array<Node>>('https://data.mitwelten.org/nodes', {});
        // return __request(OpenAPI, this.http, {
        //     method: 'GET',
        //     url: '/nodes',
        //     query: {
        //         'from': from,
        //         'to': to,
        //     },
        //     errors: {
        //         422: `Validation Error`,
        //     },
        // });
    }
}
