import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { Map, Marker } from 'maplibre-gl';
import { CoordinatePoint } from 'src/app/shared/coordinate-point.type';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {

  map: Map | undefined;

  @Input()
  coordinates: CoordinatePoint = { lat: 0 , lon: 0 };

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
  ngAfterViewInit(): void {

    const initialState = { lng: this.coordinates.lon, lat: this.coordinates.lat, zoom: 17 };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: `https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom
    });

    new Marker({color: "#FF0000"})
      .setLngLat([this.coordinates.lon, this.coordinates.lat])
      .addTo(this.map);
  }


}
