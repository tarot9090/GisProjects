/**
 * NOTE: This is just a small prototype example of messing around with OpenLayers and incorporating several components. Several components may look weird until refined such as if the geometry control is displayed but not the marker control as they are absolute positioned at the moment so in that case there will be a gap until more work can be put into this (such as a parent element with display-block of children so they always stack at top).
 */


var map;
var mapConfig = {
    init: {
        addMarker: true,
        addDraw: true,
        addTrack: true,
        addCoordinates: true,
    },
    draw: {
        drawType: null,
        activeDraw: null,
        hasActiveDraw: false,
        highlightList: [],
        highlightStyle: null
    },
    track: null,
    layers: {
        marker: null,
        draw: null,
        track: null
    }
};

initializeMap(mapConfig.init);

/**
 *
 */
function initializeMap(options) {
    addMap();
    establishListeners();

    if (options.addMarker) {
        addMarkerLayer();
    }

    if (options.addDraw) {
        addDrawLayer();
    }

    if (options.addTrack) {
        addTrackLayer();
    }

    if (options.addCoordinates) {
        addCoordinatesControl();
    }
}



function addMap() {



    const styles = [
        'RoadOnDemand',
        'Aerial',
        'AerialWithLabelsOnDemand',
        'CanvasDark',
        'OrdnanceSurvey',
        'OSM',
        'GoogleRoadNames',
        'GoogleRoad',
        'GoogleSatellite',
        'GoogleHybrid',
        'GoogleTerrain',
        'GoogleOnlyRoad'


    ];
    const layers = [];
    let i, ii;
    for (i = 0, ii = styles.length; i < ii; ++i) {

        if (styles[i] == 'OSM') {
            layers.push(
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            );
        }
        else if (styles[i] == 'GoogleRoadNames') {
            layers.push(new ol.layer.Tile({
                title: "Google Road Names",
                source: new ol.source.TileImage({ url: 'http://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}' }),
            })
            );
        }
        else if (styles[i] == 'GoogleRoad') {
            layers.push(new ol.layer.Tile({
                title: "Google Road Map",
                source: new ol.source.TileImage({ url: 'http://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}' }),
            })
            );
        }
        else if (styles[i] == 'GoogleSatellite') {
            layers.push(new ol.layer.Tile({
                title: "Google Satellite",
                source: new ol.source.TileImage({ url: 'http://mt1.google.com/vt/lyrs=s&hl=pl&&x={x}&y={y}&z={z}' }),
            })
            );
        }
        else if (styles[i] == 'GoogleHybrid') {
            layers.push(new ol.layer.Tile({
                title: "Google Satellite & Roads",
                source: new ol.source.TileImage({ url: 'http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' }),
            })
            );
        }
        else if (styles[i] == 'GoogleTerrain') {
            layers.push(new ol.layer.Tile({
                title: "Google Terrain",
                source: new ol.source.TileImage({ url: 'http://mt1.google.com/vt/lyrs=t&x={x}&y={y}&z={z}' }),
            })
            );
        }
        else if (styles[i] == 'GoogleOnlyRoad') {
            layers.push(new ol.layer.Tile({
                title: "Google Road without Building",
                source: new ol.source.TileImage({ url: 'http://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}' }),
            })
            );
        }


        else {
            layers.push(
                new ol.layer.Tile({
                    visible: false,
                    preload: Infinity,
                    source: new ol.source.BingMaps({
                        key: 'Aso3V99XwHkQtuSQFkBiyPP1ADe3JOaHjU1h6qbzY_nB79H78oUR26_CNb5oy0yM',
                        imagerySet: styles[i],
                        // use maxZoom 19 to see stretched tiles instead of the BingMaps
                        // "no photos at this zoom level" tiles
                        // maxZoom: 19
                    }),
                })
            );
        }

    }

    const select = document.getElementById('layer-select');
    function onChange() {
        const style = select.value;
        for (let i = 0, ii = layers.length; i < ii; ++i) {
            layers[i].setVisible(styles[i] === style);
        }
    }
    select.addEventListener('change', onChange);
    onChange();

    ol.events.condition.custom = function (mapBrowserEvent) {
        var browserEvent = mapBrowserEvent.originalEvent;
        return (browserEvent.ctrlKey && browserEvent.shiftKey);
    };

    map = new ol.Map({
        target: 'map',
        layers: layers,
        view: new ol.View({
            center: ol.proj.fromLonLat([39.565859, 35.2157999]),
            zoom: 3


        }),
        interactions: ol.interaction.defaults().extend([new ol.interaction.DragRotate({
            condition: ol.events.condition.custom
        })]),
        controls: ol.control.defaults({
            attribution: false,
            zoom: true,

        }),
    });

    /**
     * If adding controls to the map on init, they can be added through...
     *
     * controls: ol.control.defaults().extend([
     *		new ol.control.Control({
     * 			element: element
     *		})
     * ]),
     */
}
function getStyle(feature) {
    return [new ol.style.Style({
        image: new ol.style.RegularShape({
            fill: new ol.style.Fill({ color: [0, 0, 255, 0.4] }),
            stroke: new ol.style.Stroke({ color: [0, 0, 255, 1], width: 1 }),
            radius: 10,
            points: 3,
            angle: feature.get('angle') || 0
        }),
        fill: new ol.style.Fill({ color: [0, 0, 255, 0.4] }),
        stroke: new ol.style.Stroke({ color: [0, 0, 255, 1], width: 1 })
    })];
}



// Set cursor style
ol.interaction.Transform.prototype.Cursors['rotate'] = 'url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXAgMAAACdRDwzAAAAAXNSR0IArs4c6QAAAAlQTFRF////////AAAAjvTD7AAAAAF0Uk5TAEDm2GYAAAABYktHRACIBR1IAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH2wwSEgUFmXJDjQAAAEZJREFUCNdjYMAOuCCk6goQpbp0GpRSAFKcqdNmQKgIILUoNAxIMUWFhoKosNDQBKDgVAilCqcaQBogFFNoGNjsqSgUTgAAM3ES8k912EAAAAAASUVORK5CYII=\') 5 5, auto';
ol.interaction.Transform.prototype.Cursors['rotate0'] = 'url(\'data:image/png;base64,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\') 5 5, auto';

/** Style the transform handles for the current interaction
*/
function setHandleStyle() {
    if (!interaction instanceof ol.interaction.Transform) return;
    if ($("#style").prop('checked')) {
        // Style the rotate handle
        var circle = new ol.style.RegularShape({
            fill: new ol.style.Fill({ color: [255, 255, 255, 0.01] }),
            stroke: new ol.style.Stroke({ width: 1, color: [0, 0, 0, 0.01] }),
            radius: 8,
            points: 10
        });
        interaction.setStyle('rotate',
            new ol.style.Style({
                text: new ol.style.Text({
                    text: '\uf0e2',
                    font: "16px Fontawesome",
                    textAlign: "left",
                    fill: new ol.style.Fill({ color: 'red' })
                }),
                image: circle
            }));
        // Center of rotation
        interaction.setStyle('rotate0',
            new ol.style.Style({
                text: new ol.style.Text({
                    text: '\uf0e2',
                    font: "20px Fontawesome",
                    fill: new ol.style.Fill({ color: [255, 255, 255, 0.8] }),
                    stroke: new ol.style.Stroke({ width: 2, color: 'red' })
                }),
            }));
        // Style the move handle
        interaction.setStyle('translate',
            new ol.style.Style({
                text: new ol.style.Text({
                    text: '\uf047',
                    font: "20px Fontawesome",
                    fill: new ol.style.Fill({ color: [255, 255, 255, 0.8] }),
                    stroke: new ol.style.Stroke({ width: 2, color: 'red' })
                })
            }));
        // Style the strech handles
        /* uncomment to style * /
        interaction.setStyle ('scaleh1', 
          new ol.style.Style({
            text: new ol.style.Text ({
            text:'\uf07d', 
            font:"bold 20px Fontawesome", 
            fill: new ol.style.Fill({ color:[255,255,255,0.8] }),
            stroke: new ol.style.Stroke({ width:2, color:'red' })
          })
        }));
        interaction.style.scaleh3 = interaction.style.scaleh1;
        interaction.setStyle('scalev',
          new ol.style.Style({
            text: new ol.style.Text ({
              text:'\uf07e', 
              font:"bold 20px Fontawesome", 
              fill: new ol.style.Fill({ color:[255,255,255,0.8] }),
              stroke: new ol.style.Stroke({ width:2, color:'red' })
            })
          }));
        interaction.style.scalev2 = interaction.style.scalev;
        /**/
    } else {
        interaction.setDefaultStyle();
    }
    // Refresh
    interaction.set('translate', interaction.get('translate'));
};

/** Set properties
*/
function setPropertie(p) {
    interaction.set(p, $("#" + p).prop('checked'));
    if (!$("#scale").prop("checked")) $("#stretch").prop('disabled', true);
    else $("#stretch").prop('disabled', false);
}

function setAspectRatio(p) {
    if ($("#" + p).prop('checked')) interaction.set("keepAspectRatio", ol.events.condition.always);
    else interaction.set("keepAspectRatio", function (e) { return e.originalEvent.shiftKey });
}

var interaction = new ol.interaction.Transform({
    enableRotatedTransform: false,
    /* Limit interaction inside bbox * /
    condition: function(e, features) {
      return ol.extent.containsXY([-465960, 5536486, 1001630, 6514880], e.coordinate[0], e.coordinate[1]);
    },
    /* */
    addCondition: ol.events.condition.shiftKeyOnly,
    // filter: function(f,l) { return f.getGeometry().getType()==='Polygon'; },
    // layers: [vector],
    hitTolerance: 2,
    translateFeature: $("#translateFeature").prop('checked'),
    scale: $("#scale").prop('checked'),
    rotate: $("#rotate").prop('checked'),
    keepAspectRatio: $("#keepAspectRatio").prop('checked') ? ol.events.condition.always : undefined,
    translate: $("#translate").prop('checked'),
    stretch: $("#stretch").prop('checked')
});
map.addInteraction(interaction);
// Style handles
setHandleStyle();
// Events handlers
var startangle = 0;
var d = [0, 0];

// Handle rotate on first point
var firstPoint = false;
interaction.on(['select'], function (e) {
    if (firstPoint && e.features && e.features.getLength()) {
        interaction.setCenter(e.features.getArray()[0].getGeometry().getFirstCoordinate());
    }
});

interaction.on(['rotatestart', 'translatestart'], function (e) {
    // Rotation
    startangle = e.feature.get('angle') || 0;
    // Translation
    d = [0, 0];
});
interaction.on('rotating', function (e) {
    $('#info').text("rotate: " + ((e.angle * 180 / Math.PI - 180) % 360 + 180).toFixed(2));
    // Set angle attribute to be used on style !
    e.feature.set('angle', startangle - e.angle);
});
interaction.on('translating', function (e) {
    d[0] += e.delta[0];
    d[1] += e.delta[1];
    $('#info').text("translate: " + d[0].toFixed(2) + "," + d[1].toFixed(2));
    if (firstPoint) {
        interaction.setCenter(e.features.getArray()[0].getGeometry().getFirstCoordinate());
    }
});
interaction.on('scaling', function (e) {
    $('#info').text("scale: " + e.scale[0].toFixed(2) + "," + e.scale[1].toFixed(2));
    if (firstPoint) {
        interaction.setCenter(e.features.getArray()[0].getGeometry().getFirstCoordinate());
    }
});
interaction.on(['rotateend', 'translateend', 'scaleend'], function (e) {
    $('#info').text("");
});

/**
 * TODO - Needs rework as dbl-click on map when adding polygon or line still zooms in
 */
function establishListeners() {
    var drawConfig = mapConfig.draw;

    // On single click, if finishing a draw, then clear the draw type so double click is active again
    map.on('singleclick', function () {
        if (drawConfig.drawType && (drawConfig.drawType === 'Point' || !drawConfig.hasActiveDraw)) {
            drawConfig.drawType = null;
        }
    });

    // On double click, if finishing a draw, then allow double clicks (aka map zoom in)
    map.on('dblclick', function () {
        if (drawConfig.drawType) {
            drawConfig.hasActiveDraw = false;
            drawConfig.drawType = null;
            return false;
        }
    });

    // On pointer move, highlight any draw objects that are moved over
    map.on('pointermove', function (event) {
        if (!drawConfig.hasActiveDraw) {
            // If there are any previous highlighted draw objects, then unhighlight them
            if (drawConfig.highlightList.length > 0) {
                $(drawConfig.highlightList).each(function (index, item) {
                    item.setStyle(null);
                });
                drawConfig.highlightList = [];
            }

            // For any draw objects in the draw layer that the pointer moves on, set it to be highlighted
            $(mapConfig.layers.draw.getSource().getFeaturesAtCoordinate(event.coordinate)).each(function (index, item) {
                item.setStyle(drawConfig.highlightStyle);
                drawConfig.highlightList.push(item);
            });
        }
    });
}

/**
 *
 */
function addMarkerLayer() {
    // Create the item mappings
    var itemMappings = [{
        name: 'Item 1',
        latitude: 39.9030394,
        longitude: 32.8125798
    }
        //, {
        //    name: 'Item 2',
        //    latitude: 51.52,
        //    longitude: -0.075
        //}, {
        //    name: 'Item 3',
        //    latitude: 51.49,
        //    longitude: -0.13
        //}
    ];

    // Build the list of markers
    var markerList = [];
    $(itemMappings).each(function (index, item) {
        markerList.push(new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([item.longitude, item.latitude])),
        }));
    });

    // Create the marker layer with a style that applies to all markers
    var mapMarkerLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: markerList
        }),
        style: new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({
                    color: '#61A1CC'
                }),
                stroke: new ol.style.Stroke({
                    color: '#4282AD',
                    width: 2
                }),
                radius: 7
            })
        })
    });

    // Once there is an icon, replace the Vector layer style prop with the commented out style below
    /*
    new ol.style.Style({
      image: new ol.style.Icon(({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 0.75,
        src: '/path/to/marker/icon.png'
      }))
    })
    */

    // Add the marker layer to the map
    map.addLayer(mapMarkerLayer);
    mapConfig.layers.marker = mapMarkerLayer;

    // Add the marker control
    addMarkerControl();
}

/**
 *
 */
function addDrawLayer() {
    // Create the draw layer with a style that applies to the appropriate type
    var mapDrawLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: new ol.Collection()
        }),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(70, 187, 220, .3)'
            }),
            stroke: new ol.style.Stroke({
                color: '#167792',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#167792'
                })
            })
        })
    });

    // Create the style used for highlighting the draw objects
    mapConfig.draw.highlightStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(22, 114, 140, .3)'
        }),
        stroke: new ol.style.Stroke({
            color: '#085267',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#085267'
            })
        })
    });

    // Add the draw layer to the map
    map.addLayer(mapDrawLayer);
    mapConfig.layers.draw = mapDrawLayer;

    // Add the geometry control
    addGeometryControl();
}

/**
 *
 */
function addTrackLayer() {
    var mapView = map.getView();

    // Create the track layer
    var positionFeature = new ol.Feature();
    var mapTrackLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [
                positionFeature
            ]
        }),
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#3399CC'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            })
        })
    });

    // Create the location tracker
    var geolocation = new ol.Geolocation({
        projection: mapView.getProjection()
    });

    geolocation.on('change:position', function () {
        var coordinates = geolocation.getPosition();
        positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
        mapView.setCenter(geolocation.getPosition());
    });

    // Add the track layer to the map
    map.addLayer(mapTrackLayer);
    mapConfig.layers.track = mapTrackLayer;
    mapConfig.track = geolocation;

    addTrackControl();
}

/**
 *
 */
function addMarkerControl() {
    // Map Marker Control: Create the map marker button
    var markerBtn = document.createElement('button');
    markerBtn.className = 'fa fa-map-marker';
    markerBtn.title = 'Add a new map marker';
    $(markerBtn).click(function () {
        // TODO - Add code to insert a new map marker once user clicks next
    });

    // Map Marker Control: Create the map marker container
    var markerContainer = document.createElement('div');
    markerContainer.className = 'marker_control ol-unselectable ol-control';
    markerContainer.appendChild(markerBtn);

    // Map Marker Control: Add the map marker container as a control
    map.addControl(new ol.control.Control({
        element: markerContainer
    }));
}

/**
 *
 */

function addGeometryControl() {
    // Geometry Type Control: Create the geometry type button
    var geometryBtn = document.createElement('button');
    geometryBtn.className = 'geometry_btn fa fa-dot-circle-o';
    geometryBtn.title = 'Toggle the geometry type selector';
    $(geometryBtn).click(function () {
        $(this).parent().toggleClass('ol-collapsed');
    });

    // Geometry Type Control: Create the geometry type list
    var geometryTypeList = document.createElement('ul');
    $(['Point', 'Line', 'Circle', 'Polygon']).each(function (index, geometryType) {
        var newListItem = document.createElement('li');
        newListItem.innerHTML = geometryType;
        newListItem.title = 'Add a new ' + geometryType;
        newListItem.setAttribute("data-geometry-type", geometryType);
        geometryTypeList.appendChild(newListItem);

        // On geometry type change, remove the previous interaction and add the new one
        $(newListItem).click(function () {
            var listItem = $(this);
            var geometryType = $(this).data('geometry-type');
            var drawConfig = mapConfig.draw;
            var activeDraw = drawConfig.activeDraw;
            if (geometryType === 'Line') {
                geometryType = 'LineString';
            }

            // Should probably fire an event instead to be listened to
            if (activeDraw) {
                map.removeInteraction(activeDraw);
            }

            drawConfig.hasActiveDraw = true;

            activeDraw = new ol.interaction.Draw({
                source: mapConfig.layers.draw.getSource(),
                type: geometryType
            });

            if (geometryType == 'LineString') {
                activeDraw.on('drawstart', function (event) {
                    // vectorLayer.getSource().clear();

                    event.feature.on('change', function (event) {

                        var measurement = geometryType === 'Polygon' ? event.target.getGeometry().getArea() : event.target.getGeometry().getLength();
                        var measurementFormatted = measurement > 100 ? (measurement / 1000).toFixed(2) + 'km' : measurement.toFixed(2) + 'm';
                        document.getElementById('lblRuler').innerHTML = "Length: " + measurementFormatted;
                    });
                });
            }



            activeDraw.on('drawend', function () {
                map.removeInteraction(activeDraw);
                drawConfig.hasActiveDraw = false;


            });

            map.addInteraction(activeDraw);

            // Close the geometry type selector list
            listItem.parents('.geometry_control').toggleClass('ol-uncollapsed');
        });
    });



    // New vector layer
    var vector = new ol.layer.Vector({
        name: 'Vecteur',
        source: new ol.source.Vector({ wrapX: false }),
        style: getStyle
    })
    map.addLayer(vector);


    mapConfig.layers.draw.getSource().on('addfeature', function (evt) {
        var feature = evt.feature;
        var coords = feature.getGeometry().getCoordinates();
        //feature.geometry.resize(1.5, origin);
        //for (var i = 0; i < coords.length; i++) {
        //    var x = feature.getGeometry().getCoordinates()[i][0] ;
        //    var y = feature.getGeometry().getCoordinates()[i][1] ;
        //    var list = [];
        //    list.push(x + ',' + y);
        //}
   

    });
    vector.getSource().addFeature(new ol.Feature(new ol.geom.Polygon([[[34243, 6305749], [-288626, 5757848], [210354, 5576845], [300000, 6000000], [34243, 6305749]]])));
    //vector.getSource().addFeature(new ol.Feature(new ol.geom.LineString([[406033, 5664901], [689767, 5718712], [699551, 6149206], [425601, 6183449]])));
    //vector.getSource().addFeature(new ol.Feature(new ol.geom.Point([269914, 6248592])));
    //vector.getSource().addFeature(new ol.Feature(new ol.geom.Circle([500000, 6400000], 100000)));

    // Geometry Type Control: Create the geometry type container
    var geometryContainer = document.createElement('div');
    geometryContainer.className = 'geometry_control ol-unselectable ol-control ol-uncollapsed';
    geometryContainer.appendChild(geometryBtn);
    geometryContainer.appendChild(geometryTypeList);

    // Geometry Type Control: Add the geometry type container as a control
    map.addControl(new ol.control.Control({
        element: geometryContainer
    }));
}

/**
 *
 */
function addTrackControl() {
    // Track Control: Create the track button
    var trackBtn = document.createElement('button');
    trackBtn.className = 'fa fa-location-arrow';
    trackBtn.title = 'Toggle location tracking';
    $(trackBtn).click(function () {
        var geolocation = mapConfig.track;
        geolocation.setTracking(!geolocation.getTracking());
        $(this).toggleClass('active_track');
    });

    // Track Control: Create the track container
    var trackContainer = document.createElement('div');
    trackContainer.className = 'track_control ol-unselectable ol-control';
    trackContainer.appendChild(trackBtn);

    // Track Control: Add the track container as a control
    map.addControl(new ol.control.Control({
        element: trackContainer
    }));
}

/**
 *
 */
function addCoordinatesControl() {
    // Coordinate Control: Create the coordinate button
    var coordinateBtn = document.createElement('button');
    coordinateBtn.className = 'fa fa-map-signs';
    coordinateBtn.title = 'Toggle the map coordinates display';
    $(coordinateBtn).click(function () {
        $(this).parent().toggleClass('ol-collapsed');
    });

    // Coordinate Control: Create the coordinate container
    var coordinateContainer = document.createElement('div');
    coordinateContainer.id = 'coordinate_control';
    coordinateContainer.className = 'ol-unselectable ol-control ol-uncollapsed';
    coordinateContainer.appendChild(coordinateBtn);

    // Coordinate Control: Add the coordinate container as a control
    map.addControl(new ol.control.Control({
        element: coordinateContainer
    }));

    // Mouse Position Control: Add the mouse position as a control which will create a child div element in the coordinate container element with the specified class
    map.addControl(new ol.control.MousePosition({
        coordinateFormat: function (coordinate) {
            return ol.coordinate.format(coordinate, 'Lat: {y}, Long: {x}', 4);
        },
        className: 'coordinate_display',
        target: 'coordinate_control',
        projection: 'EPSG:4326',
        undefinedHTML: '&nbsp;'
    }));
}
var response;
function searchAddress(address) {
    // alert(address);

    const xhr = new XMLHttpRequest();
    var url = "https://api.opencagedata.com/geocode/v1/json?q=" + address + "&key=65744e26ca7e4c9eb55f6d41f45b59a7&language=tr&pretty=1";

    xhr.open("GET", url);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            if ((this.status == 200) && (this.status < 300)) {
                //console.log(this.responseText);
                response = this.responseText;
                const obj = JSON.parse(response);

                map.getView().animate({
                    center: ol.proj.fromLonLat([obj.results[0].geometry.lng, obj.results[0].geometry.lat]),
                    zoom: 13,
                });

                var layer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: [
                            new ol.Feature({
                                geometry: new ol.geom.Point(ol.proj.fromLonLat([obj.results[0].geometry.lng, obj.results[0].geometry.lat]))
                            })
                        ]
                    })
                });
                map.addLayer(layer);
            }
        }
    }
}


function jsonExport() {
    var geom = [];
    mapConfig.layers.draw.getSource().forEachFeature(
        function (feature) {

            geom.push(new ol.Feature(feature.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326'))
            );
        });
    var writer = new ol.format.GeoJSON();
    var geoJsonStr = writer.writeFeatures(geom);
    console.log(geoJsonStr);

    document.getElementById('lblJson').innerHTML = geoJsonStr;
    /* console.log(geoJsonStr) */
}
