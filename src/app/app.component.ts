import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  lavaderos: any = [];
  map!: mapboxgl.Map;
  zoomInicial = 14;
  ciudad = 'Armenia, Quindio';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    (mapboxgl as any).accessToken = "pk.eyJ1Ijoia2V2aW5vcnRlZ2EiLCJhIjoiY2xocWg3M3I3MDJ4OTNwbmtjaHNqeGg5ZCJ9.r8eGnQZEtKmjEpKtAVoopA"

    const latitudInicial = 4.53073602194441;
    const longitudInicial = -75.6926135253908;
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitudInicial, latitudInicial],
      zoom: this.zoomInicial,
      touchZoomRotate: false, // Desactiva la función de zoom y rotación en dispositivos táctiles
      interactive: true, // Activa la interacción con el mapa
      dragPan: true, // Permite arrastrar el mapa
      scrollZoom: true, // Permite hacer zoom con el desplazamiento del mouse
      attributionControl: true, // Muestra la atribución de los datos del mapa
    });

    // Elimina marcadores de ubicacion y agregar otro al dar click
    let marker: any;
    this.map.on('click', (e: any) => {
      if (marker) {
        marker.remove();
      }
      marker = new mapboxgl.Marker().setLngLat(e.lngLat).addTo(this.map);
      console.log(e.lngLat);
    });

    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
      'bottom-right'
    );

    this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    this.map.on('load', () => {
      this.map.addSource('lavaderos', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-75.6926135253908, 4.53073602194441],
              },
              properties: {
                title: 'Lavadero 1',
                description: 'Lavadero 1',
              },
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-75.6726135253908, 4.53073602194441],
              },
              properties: {
                title: 'Lavadero 2',
                description: 'Lavadero 2',
              },
            },
          ],
        },
      });


      this.map.addLayer({
        id: 'lavaderos',
        type: 'circle',
        source: 'lavaderos',
        paint: {
          'circle-color': '#ff0000',
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      const popup = new mapboxgl.Popup({
        closeButton:false,
        closeOnClick:false
        });

      this.map.on('mouseenter', 'lavaderos', (e:any) => {
        this.map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();
        const nombre = e.features[0].properties.title;
        const description = e.features[0].properties.description;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) { // Esto es para que el popup no se salga del mapa
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        // Nombre y descripción del popup
        popup.setLngLat(coordinates).setHTML('<h3>' + nombre + '</h3><p>' + description + '</p>').addTo(this.map);
      });

      this.map.on('mouseleave', 'lavaderos', () => {
        this.map.getCanvas().style.cursor = '';
        popup.remove();
      });
    });
  }

  searchCity() {
    this.http
      .get(
        'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
          this.ciudad +
          '.json?access_token=' +
          "pk.eyJ1Ijoia2V2aW5vcnRlZ2EiLCJhIjoiY2xocWg3M3I3MDJ4OTNwbmtjaHNqeGg5ZCJ9.r8eGnQZEtKmjEpKtAVoopA"

      )
      .subscribe((res: any) => {
        this.map.flyTo({
          center: res.features[0].center,
          zoom: this.zoomInicial,
        });
      });
  }
}
