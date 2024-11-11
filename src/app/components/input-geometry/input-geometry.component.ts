import { Component, ElementRef, ViewChild } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { circle, latLng, polygon, tileLayer } from 'leaflet';

@Component({
  selector: 'app-input-geometry',
  standalone: true,
  imports: [
    LeafletModule
  ],
  templateUrl: './input-geometry.component.html',
  styleUrl: './input-geometry.component.css'
})
export class InputGeometryComponent {
  @ViewChild('map', { static: true }) map: ElementRef | undefined;
  height: number = 1000;
  
  ngAfterViewInit() {
    this.height = this.map!.nativeElement.offsetHeight;
    const parentDiv = this.map!.nativeElement.parentElement.parentElement;
    if (parentDiv) {
      this.height = parentDiv.offsetHeight;
      console.log();
      console.log(parentDiv.height);
    }
  }
  options = {
    layers: [
      tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' })
    ],
    zoom: 3,
    center: latLng(46.879966, -121.726909),
    trackResize: false
  };

  layersControl = {
    baseLayers: {
      'Open Street Map': tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
      'Open Cycle Map': tileLayer('https://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    },
    overlays: {
      'Big Circle': circle([ 46.95, -122 ], { radius: 5000 }),
      'Big Square': polygon([[ 46.8, -121.55 ], [ 46.9, -121.55 ], [ 46.9, -121.7 ], [ 46.8, -121.7 ]])
    }
  }
}
