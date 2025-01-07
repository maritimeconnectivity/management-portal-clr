import { Component, ElementRef, Input, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { LeafletDrawModule } from '@bluehalo/ngx-leaflet-draw';
import * as L from 'leaflet';
import { circle, circleMarker, DrawEvents, featureGroup, FeatureGroup, latLng, latLngBounds, polygon, rectangle, tileLayer } from 'leaflet';

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
  @Input() mapContainerHeight: number = 200;
  @ViewChild('map', { static: true }) mapElement: ElementRef | undefined;
  mapFitToBounds: L.LatLngBounds = latLngBounds([-50, -10], [50, 10]);
  responseFeatureGroup: FeatureGroup = featureGroup();
  queryFeatureGroup: FeatureGroup = featureGroup();
  
  constructor(private el: ElementRef, private renderer: Renderer2 ){

  }

  options = {
    layers: [
      tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' })
    ],
    trackResize: false
  };

  drawnItems: FeatureGroup = featureGroup();

  drawOptions = {
    draw: {
      circle: undefined,
      rectangle: undefined,
      circlemarker: undefined,
    },
    edit: {
      featureGroup: this.responseFeatureGroup
    }
  };

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (this.fullscreen) {
      this.mapContainerHeight = window.innerHeight - 120;
      console.log('Full screen height:', this.mapContainerHeight);
    }
  }

  ngAfterViewInit() {
    
  }

  public onDrawCreated(e: any) {
    this.drawnItems.addLayer((e as DrawEvents.Created).layer);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadGeometryOnMap();
    //this.addFeatures();
  }

  clearMap = () => {
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
