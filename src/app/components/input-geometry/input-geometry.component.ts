import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { LeafletDrawModule } from '@bluehalo/ngx-leaflet-draw';
import * as L from 'leaflet';
import { circle, circleMarker, featureGroup, FeatureGroup, latLng, latLngBounds, polygon, rectangle, tileLayer, DrawEvents } from 'leaflet';
import { getGeometryCollectionFromMap } from 'src/app/common/mapToGeometry';

@Component({
  selector: 'app-input-geometry',
  standalone: true,
  imports: [
    LeafletModule,
    LeafletDrawModule
  ],
  templateUrl: './input-geometry.component.html',
  styleUrl: './input-geometry.component.css'
})
export class InputGeometryComponent {
  @Input() isEditing: boolean = false;
  @Input() geometry: object[] = [];
  @Input() geometryNames: string[] = [];
  @Input() fullscreen: boolean = false;
  @Input() isForSearch: boolean = false;
  @Input() mapContainerHeight: number = 200;
  @Output() onGeometryChange = new EventEmitter<any>();
  @Output() onClear = new EventEmitter<any>();
  @ViewChild('map', { static: true }) mapElement: ElementRef | undefined;
  mapFitToBounds: L.LatLngBounds = latLngBounds([-50, -10], [50, 10]);
  mapContainerHeightOffset = 120;

  options = {
    layers: [
      tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' })
    ],
    trackResize: false
  };

  drawnItems: FeatureGroup = featureGroup();
  responseFeatureGroup: FeatureGroup = featureGroup();
  drawnGroup: FeatureGroup = featureGroup();

  drawOptions = {
    draw: {
      circle: undefined,
      rectangle: undefined,
      circlemarker: undefined,
      polygon: {
        shapeOptions: {
          color: '#f35f57',
          weight: 10,
        },
      },
      polyline: {
        shapeOptions: {
          color: '#f35f57',
          weight: 10,
        },
      },
    },
    edit: {
      featureGroup: this.drawnGroup
    }
  };

  constructor(private el: ElementRef, private renderer: Renderer2 ){
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (this.fullscreen) {
      this.mapContainerHeight = window.innerHeight - this.mapContainerHeightOffset;
    }

    this.drawnItems.addLayer(this.responseFeatureGroup);
    this.drawnItems.addLayer(this.drawnGroup);
  }

  public onDrawCreated(e: any) {
    this.drawnGroup.addLayer((e as DrawEvents.Created).layer);
    this.onGeometryChange.emit({ fieldName: 'geometry',
      data: getGeometryCollectionFromMap( this.isForSearch || this.isEditing ? this.drawnGroup : this.responseFeatureGroup)});
  }

  public onDrawDeleted(e: any) {
    this.drawnGroup.clearLayers();
    this.onClear.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadGeometryOnMap();
  }

  clearMap = () => {
    this.drawnGroup.clearLayers();
    this.responseFeatureGroup.clearLayers();
    this.geometry = [];
    this.geometryNames = [];
  }

  loadGeometryOnMap = () => {
    // there is nothing to draw!
    if (this.geometry.length === 0) {
      return ;
    }

    // Recreate the drawn items feature group
    if (this.responseFeatureGroup) {
      this.responseFeatureGroup.clearLayers();
    } else {
      this.responseFeatureGroup = new L.FeatureGroup();
    }

    this.geometry.forEach( (geometry: any, i: number) =>
    {
      if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
        return;
      }
      if (this.isForSearch) {
        // when this is for search, we will not render the geometry covers the whole world
        if (geometry.type === 'Polygon' && geometry.coordinates[0].filter((e: any[]) => JSON.stringify(e) === JSON.stringify([-180, -90])).length === 2) {
          return ;
        }
      }
      const geomLayer = L.geoJSON(geometry);
      this.responseFeatureGroup.addLayer(geomLayer);
      //*
      // assign name plate to the region
      if (this.geometryNames && this.geometryNames.length > 0 && this.geometryNames[i]) {
        if (geometry.type === 'Point') {
          const coordinate = geometry.coordinates;
          this.setToolTip(this.geometryNames[i], coordinate[1], coordinate[0]);
        } else {
          const coordinate = geomLayer.getBounds().getCenter();
          this.setToolTip(this.geometryNames[i], coordinate.lat, coordinate.lng);
        }
      }
    });
    if (this.responseFeatureGroup.getLayers().length > 0) {
      this.mapFitToBounds = this.responseFeatureGroup.getBounds();
    }
  }

  setToolTip = (tooltipString: string, lat: number, lng: number) => {
    const marker = L.marker([lat, lng], { opacity: 0.01 }); //opacity may be set to zero
    marker.bindTooltip(tooltipString, {permanent: true, className: "my-label", offset: [0, 0] });
    marker.addTo(this.responseFeatureGroup);
  }
}
