import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges,
  OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Map, Marker } from 'maplibre-gl';
import { CoordinatePoint } from 'src/app/shared/coordinate-point.type';

@Component({
  // changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  map: Map | undefined;
  marker: Marker | undefined;

  @Output()
  coordinatesSet = new EventEmitter<CoordinatePoint>;

  @Input()
  coordinates: CoordinatePoint = { lon: 7.614704694445322, lat: 47.53603016174955 } ;

  @Input()
  readonly = true;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
  ngAfterViewInit(): void {

    let draggable = false;
    let initialState = { lng: this.coordinates.lon, lat: this.coordinates.lat, zoom: 15 };

    if (this.readonly === false) {
      draggable = true;
    } else {
      initialState = { lng: this.coordinates.lon, lat: this.coordinates.lat, zoom: 17 };
      draggable = false;
    }

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: `https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom
    });

    this.marker = new Marker({color: "#FF0000", draggable: draggable})
      .setLngLat([initialState.lng, initialState.lat])
      .addTo(this.map);

    this.marker.on('drag', () => {
      const ll = this.marker?.getLngLat();
      if (ll !== undefined) {
        this.coordinatesSet.emit({lat: ll.lat, lon: ll.lng});
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('coordinates' in changes) {
      this.map?.setCenter(changes['coordinates'].currentValue)
      this.marker?.setLngLat(changes['coordinates'].currentValue)
    }
  }

}
