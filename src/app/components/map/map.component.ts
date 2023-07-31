import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges,
  OnDestroy, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { FeatureCollection } from 'geojson';
import { GeoJSONSource, LngLatBoundsLike, Map, Marker } from 'maplibre-gl';
import { CoordinatePoint } from 'src/app/shared';

@Component({
  // changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnDestroy, OnChanges {

  map: Map | undefined;
  marker: Marker | undefined;

  @Output()
  coordinatesSet = new EventEmitter<CoordinatePoint>;

  @Input()
  coordinates: CoordinatePoint = { lon: 7.614704694445322, lat: 47.53603016174955 } ;

  @Input()
  readonly = true;

  set features(features: FeatureCollection) {
    this.drawFeatures(this.map, features);
  }

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor() { }

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
      // `https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json`,
      style: `https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte-imagery.vt/style.json`,
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

  private drawFeatures(map: Map, features: FeatureCollection) {
    // zoom to features
    if (features.features.length) {
      const lngs = features.features.map(f => f.geometry.type === 'Point' ? f.geometry.coordinates[0] : 0).sort();
      const lats = features.features.map(f => f.geometry.type === 'Point' ? f.geometry.coordinates[1] : 0).sort();
      const bbox = <LngLatBoundsLike>[lngs[0]-0.001, lats[0]-0.001, lngs[lngs.length-1]+0.001, lats[lats.length-1]+0.001];
      this.map.fitBounds(bbox);
    }

    // set features/layer
    const source = <GeoJSONSource>this.map?.getSource('customFeatures');
    if (source) {
      source.setData(features)
    } else {
      map.addSource('customFeatures', {
        type: 'geojson',
        data: features
      });
      map.addLayer({
        id: 'customFeatures',
        type: 'circle',
        source: 'customFeatures',
        layout: { },
        paint: {
          'circle-radius': 8,
          'circle-color': '#fff',
          'circle-opacity': 0.6,
          'circle-stroke-color': '#D42222',
          'circle-stroke-opacity': 0.9,
          'circle-stroke-width': 2
        }
      });
    }
  }

}
