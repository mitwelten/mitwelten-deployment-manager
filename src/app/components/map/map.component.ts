import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges,
  OnDestroy, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { FeatureCollection } from 'geojson';
import { GeoJSONSource, LngLatBoundsLike, Map, Marker, Popup } from 'maplibre-gl';
import { ReplaySubject } from 'rxjs';
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
  popup: Popup | undefined;

  private features$ = new ReplaySubject<FeatureCollection>;

  @Output()
  coordinatesSet = new EventEmitter<CoordinatePoint>;

  @Output()
  editFeature =  new EventEmitter<number>;

  @Input()
  coordinates: CoordinatePoint = { lon: 7.614704694445322, lat: 47.53603016174955 } ;

  @Input()
  readonly = true;

  set features(features: FeatureCollection) {
    this.features$.next(features);
  }

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor() { }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  ngAfterViewInit(): void {

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      // `https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json`,
      style: `https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte-imagery.vt/style.json`,
      center: [this.coordinates.lon, this.coordinates.lat],
      zoom: this.readonly ? 17 : 15,
    });

    this.map.on('load', (e) => {
      this.marker = new Marker({color: "#FF0000", draggable: !this.readonly})
        .setLngLat([this.coordinates.lon, this.coordinates.lat])
        .addTo(this.map);

      this.marker.on('drag', () => {
        const ll = this.marker?.getLngLat();
        if (ll !== undefined) {
          this.coordinatesSet.emit({lat: ll.lat, lon: ll.lng});
        }
      });

      this.popup = new Popup({
          closeButton: false,
          closeOnClick: false
      });

      this.features$.subscribe(features => this.drawFeatures(this.map, features));

      this.map.on('click', 'customFeatures', (e) => {
        if ('environment_id' in e.features[0].properties)
        this.editFeature.emit(e.features[0].properties['environment_id']);
      });

      this.map.on('mouseenter', 'customFeatures', (e) => {
        if (e.features[0].geometry.type !== 'Point') return;
        this.map.getCanvas().style.cursor = 'pointer';
        const coordinates = <[number, number]> e.features[0].geometry.coordinates.slice();
        const description = `
          <strong>Environment ID ${e.features[0].properties['environment_id']}</strong>
          <p>
            attr 01: ${e.features[0].properties['attribute_01']}<br>
            attr 02: ${e.features[0].properties['attribute_02']}<br>
            attr 03: ${e.features[0].properties['attribute_03']}<br>
            attr 04: ${e.features[0].properties['attribute_04']}<br>
            attr 05: ${e.features[0].properties['attribute_05']}<br>
            attr 06: ${e.features[0].properties['attribute_06']}<br>
            attr 07: ${e.features[0].properties['attribute_07']}<br>
            attr 08: ${e.features[0].properties['attribute_08']}<br>
            attr 09: ${e.features[0].properties['attribute_09']}<br>
            attr 10: ${e.features[0].properties['attribute_10']}<br>
          </p>
        `;
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        // }

        // Populate the popup and set its coordinates
        // based on the feature found.
        this.popup.setLngLat(coordinates).setHTML(description).addTo(this.map);
      });

      this.map.on('mouseleave', 'customFeatures', () => {
        this.map.getCanvas().style.cursor = '';
        this.popup.remove();
      });
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
