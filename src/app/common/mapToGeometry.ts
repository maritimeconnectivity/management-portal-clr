/*
 * Copyright (c) 2023 Maritime Connectivity Platform Consortium
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as L from 'leaflet';
import { geojsonToWKT } from '@terraformer/wkt';

export const getGeometryCollectionFromMap = (drawnItems: any) => {
    // Initialise a geometry collection
    const geometry: { type: string; geometries: any[]; crs: { type: string; properties: { name: string } } } = {
        type: 'GeometryCollection',
        geometries: [],
        crs: {
            type: 'name',
            properties: {
                name: 'EPSG:4326',
            },
        },
    };
    drawnItems.toGeoJSON().features.forEach((feature: { geometry: any; }) => {
        geometry.geometries.push(feature.geometry);
    });

    // And return
    return geometry;
}

export const getSingleGeometryFromMap = (drawnItems: any) => {
    // Initialise a single geometry object
    var geometry = undefined;
    drawnItems.toGeoJSON().features.forEach((feature: { geometry: any; }) => {
        geometry = feature.geometry;
    });
    // And return
    return geometry;
}

export const populateWKTTextArea = (drawnItems: any): string => {
    const geometry = getSingleGeometryFromMap(drawnItems);
    if(geometry) {
        return geojsonToWKT(geometry);
    } else {
        return '';
    }
}

export const addNonGroupLayers = (sourceLayer: any, targetGroup: any) => {
    if (sourceLayer instanceof L.LayerGroup) {
      sourceLayer.eachLayer(function(layer) {
        addNonGroupLayers(layer, targetGroup);
      });
    } else {
      targetGroup.addLayer(sourceLayer);
    }
}

export const removeLayers = (sourceLayer: any, targetGroup: any) => {
    if (sourceLayer instanceof L.LayerGroup) {
        sourceLayer.eachLayer(function(layer) {
            removeLayers(layer, targetGroup);
        });
    } else {
        targetGroup.removeLayer(sourceLayer);
    }
}