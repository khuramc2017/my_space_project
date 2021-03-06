/*jslint browser: true*/
/*global $*/
/*jslint devel: true */
/*jshint esversion: 6 */


var currentDate = new Date().toJSON().slice(0, 10);

var baseUrl = "https://api.nasa.gov/";
var imageOfDayUrl = "planetary/apod?";
var astroidsUrl = "neo/rest/v1/feed?";
var earthUrl = "EPIC/api/natural?";
var currentEventUrl = "https://eonet.sci.gsfc.nasa.gov/api/v2.1/events?limit=1&days=30&source=InciWeb,UNISYS,EO,AU_BOM&status=open";
var marsRoverUrl = "mars-photos/api/v1/rovers/curiosity/photos?earth_date=2017-07-02&";
var apiKey = "api_key=sk2V0orOFHi8AnuxWXNM4Tt7qGF7UFNjZgYgg49E";
var map;
var latitude = 40.7413549;
var longitude = -73.9980244;
var defaultIcon;
var largeInfowindow;
var MAP_PIN = 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z';
var currentMarker;

/* Function displays an error message for an AJAX call. */
function ajaxFailed() {
    "use strict";
    alert('Failed to load. Please check browser for the error');
}

/* Function displays an error message for an Google API call. */
function gm_authFailure() {
    "use strict";
    alert('Failed to call Google Map API: See Browser Console for Detail');
}

/* Function displays an error message for an Google API call. */
function failed() {
    "use strict";
    alert('Failed to call Google Map API: See Browser Console for Detail');
}

/* AJAX call that retrieves the image of the day from NASA and sets the
   background of the website. */
$.ajax({
    type: 'GET',
    url: baseUrl + imageOfDayUrl + apiKey,
    success: function (result) {
        "use strict";
        console.log("Image background result:");
        console.log(result);
        if (result.media_type === "video") {
            $("body").attr("background", "https://www.nasa.gov/sites/default/files/thumbnails/image/nh-pluto-in-false-color.jpg");
        } else {
            $("body").attr("background", result.hdurl);
        }
    },
    error: function (jqXHR, extStatus, errorThrown) {
        "use strict";
        console.log("Image background result error:");
        console.log(jqXHR.responseText);
        ajaxFailed();
    }
});

/* AJAX call that retrieves the list of astroids from NASA. */
$.ajax({
    type: 'GET',
    url: baseUrl + astroidsUrl + apiKey,
    success: function (result) {
        "use strict";
        console.log("Astroids result:");
        console.log(result);
        var neo = result.near_earth_objects, date = new Date(), astroids = neo[currentDate], i;
        //console.log(currentDate);
        if (astroids !== undefined && astroids.length > 0) {
            for (i = 0; i < astroids.length; i += 1) {
                $(".nearbyObjects").append("<li class='astroids'>" + astroids[i].name + "</li>");
            }
        } else {
            $(".nearbyObject").append("<li class='astroids'> No objects today </li>");

        }

    },
    error: function (jqXHR, extStatus, errorThrown) {
        "use strict";
        console.log("Astroid result error:");
        console.log(jqXHR.responseText);
        ajaxFailed();
    }
});


/* AJAX call that retrieves the recent image of Earth from NASA. */
$.ajax({
    type: 'GET',
    url: baseUrl + earthUrl + apiKey,
    success: function (result) {
        "use strict";
        console.log("Earth result:");
        console.log(result);
        $(".imageOfEarth").attr("src", "https://epic.gsfc.nasa.gov/epic-archive/png/" + result[0].image + ".png");
    },
    error: function (jqXHR, extStatus, errorThrown) {
        "use strict";
        console.log("Earth result error:");
        console.log(jqXHR.responseText);
        ajaxFailed();
    }
});

/* AJAX call that retrieves the recent image of Mars Rover from NASA. */
$.ajax({
    type: 'GET',
    url: baseUrl + marsRoverUrl + apiKey,
    success: function (result) {
        "use strict";
        console.log("Mars Rover Image result:");
        console.log(result);
        $(".imageFromMars").attr("src", result.photos[0].img_src);

    },
    error: function (jqXHR, extStatus, errorThrown) {
        "use strict";
        console.log("Mars Rover Image result error:");
        console.log(jqXHR.responseText);
        ajaxFailed();
    }
});

/* AJAX call that retrieves the recent image of an event from NASA. */
$.ajax({
    type: 'GET',
    url: currentEventUrl,
    success: function (result) {
        "use strict";
        console.log("Current Event result:");
        console.log(result);
        var event = result.events[0], geoLoc = event.geometries[0];
        if (event !== undefined && geoLoc.type === "Point") {
            longitude = geoLoc.coordinates[0];
            latitude = geoLoc.coordinates[1];
            map.setOptions({center: {lat: latitude, lng: longitude}});
            currentMarker = new google.maps.Marker({
                position: {lat: latitude, lng: longitude},
                map: map,
                draggable: false,
                icon: defaultIcon,
                title: event.title,
                animation: google.maps.Animation.DROP
            });
            largeInfowindow.marker = currentMarker;
            largeInfowindow.setContent('<div>' + currentMarker.title + '</div>');
            largeInfowindow.open(map, currentMarker);
        } else {
            currentMarker = new google.maps.Marker({
                position: {lat: latitude, lng: longitude},
                map: map,
                draggable: false,
                icon: defaultIcon,
                title: "No Event Today.",
                animation: google.maps.Animation.DROP
            });
            largeInfowindow.marker = currentMarker;
            largeInfowindow.setContent('<div>' + currentMarker.title + '</div>');
            largeInfowindow.open(map, currentMarker);
        }
    },
    error: function (jqXHR, extStatus, errorThrown) {
        "use strict";
        console.log("Current Event result error:");
        console.log(jqXHR.responseText);
        ajaxFailed();
    }
});

/* Function makes icon for the marker */
function makeMarkerIcon(icon_path, icon_color) {
    "use strict";
    return {
        path: icon_path,
        fillColor: icon_color,
        fillOpacity: 0.85,
        strokeColor: '',
        strokeWeight: 0
    };
}

/* Initialize Google Maps API and map, defaultIcon, and largeInfowindow. */
function initMap() {
    "use strict";
    //Load Map
    console.log("Building Map.");
    map = new google.maps.Map($(".currentEventMap")[0], {
        center: {lat: latitude, lng: longitude},
        zoom: 2,
        styles: [
            {
                "featureType": "all",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "off"
                    },
                    {
                        "saturation": "-100"
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "saturation": 36
                    },
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 40
                    },
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "visibility": "off"
                    },
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 17
                    },
                    {
                        "weight": 1.2
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#4d6059"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#4d6059"
                    }
                ]
            },
            {
                "featureType": "landscape.natural",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#4d6059"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "lightness": 21
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#4d6059"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#4d6059"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "color": "#7f8d89"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#7f8d89"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#7f8d89"
                    },
                    {
                        "lightness": 17
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#7f8d89"
                    },
                    {
                        "lightness": 29
                    },
                    {
                        "weight": 0.2
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 18
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#7f8d89"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#7f8d89"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#7f8d89"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#7f8d89"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 19
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#2b3638"
                    },
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#2b3638"
                    },
                    {
                        "lightness": 17
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#24282b"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#24282b"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            }
        ]
    });
    //Default Style for the marker icon.
    defaultIcon = makeMarkerIcon(MAP_PIN, '#B80000');
    //infowindow
    largeInfowindow = new google.maps.InfoWindow();
}