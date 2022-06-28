import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CoordinatePoint } from './coordinate-point.type';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() { }

  getLocation(): Observable<CoordinatePoint | false> {
    if (navigator.geolocation) {
      return new Observable(observer => {
        navigator.geolocation.getCurrentPosition((position)=>{
          const longitude = position.coords.longitude;
          const latitude = position.coords.latitude;
          observer.next({ lat: latitude, lon: longitude });
        })
      })
    } else {
       console.warn('No support for geolocation');
       return of(false);
    }
  }
}
