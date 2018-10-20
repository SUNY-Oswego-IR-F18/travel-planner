"use strict";

let vm = new Vue({
    el: '#vue-root', 
    data: {
        // origin: '',
        origin: { placeName: null, placeId: null, location: {latitude: null, longtitude: null} },
        destination: { placeName: null, placeId: null, location: {latitude: null, longtitude: null} },
        countryCode: 'US',
        weatherApiKey: "8a5ef2f6226eb0720aa8e36f2744ec83",
        googleApiKey: "AIzaSyBM4CbIYX0wLoNtqc1ByqevwQo7rzYTUug",
        httpRequest: null,
        originHttpRequest: null,
        destinationHttpRequest: null,
        XMLHttpResponseStatus: {
            OK: 200,
            BadRequest: 400,
            Unauthorized: 401,
            Forbidden: 403,
            NotFound: 404
        },
        event: null,
    },
    computed: {
        weatherUrl() {
            return `http://api.openweathermap.org/data/2.5/forecast?q=${this.origin.placeName},${this.countryCode}`;
        },
        geocodingOriginUrl() {
            return `https://maps.googleapis.com/maps/api/geocode/json?address=${this.origin.placeName}`;
        },
        geocodingDestinationUrl() {
            return `https://maps.googleapis.com/maps/api/geocode/json?address=${this.destination.placeName}`;
        },
        geocodingUrl() {
            return {
                origin: `https://maps.googleapis.com/maps/api/geocode/json?address=${this.origin.placeName}`,
                destination: `https://maps.googleapis.com/maps/api/geocode/json?address=${this.destination.placeName}`
            }
        }
    },
    methods: {
        makeRequest() {
            /*
            //// ----- need to be refactored -----
            //// https://stackoverflow.com/questions/46503558/how-to-use-multiple-xmlhttprequest
            //// In order to send a second request you need to wait for the first to finish.
            //// Instead, if we want to execute all the request completely asynchronous (in a concurrent way), the request variable must be declared and scoped inside the loop.
            for (var location in this.geocodingUrl) {
                let xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            let response = JSON.parse(xhr.responseText);
                            console.log(response);
                            console.log(response.results[0].place_id);
                            console.log(response.results[0].geometry.location);
                        } 
                    }
                };
                xhr.open('GET', this.geocodingUrl[location] + '&key=' + this.googleApiKey);
                xhr.send();
            }
            */

            //// ----- need to be refactored -----
            //// get weather forecast data 
            // this.httpRequest = new XMLHttpRequest();
            // this.httpRequest.onreadystatechange = this.handleResponse;
            // this.httpRequest.open('GET', this.weatherUrl + '&appid=' + this.weatherApiKey);
            // this.httpRequest.send();
            //// get origin geocoding data 
            this.originHttpRequest = new XMLHttpRequest();
            this.originHttpRequest.onreadystatechange = this.handleResponse;
            this.originHttpRequest.open('GET', this.geocodingOriginUrl + '&key=' + this.googleApiKey + '&language=en');
            this.originHttpRequest.send();
            //// get destination geocoding data 
            this.destinationHttpRequest = new XMLHttpRequest();
            this.destinationHttpRequest.onreadystatechange = this.handleDestinationResponse;
            this.destinationHttpRequest.open('GET', this.geocodingDestinationUrl + '&key=' + this.googleApiKey + '&language=en');
            this.destinationHttpRequest.send();

            //// ----- planning -----
            //// custom an event to monitor origin and destination 
            //// once they have been written, trigger the map update event
            //// or use data binding
            

        },
        //// handle XHR response 
	    handleResponse() {
            if (this.originHttpRequest.readyState === XMLHttpRequest.DONE) {
                //// debug console 
                // console.log(this.httpRequest.responseText);
                if (this.originHttpRequest.status === this.XMLHttpResponseStatus.OK) {
                    this.updateUISuccess(this.originHttpRequest.responseText);
                } else {
                    this.updateUIError();
                }
            }
        },
        handleDestinationResponse() {
            if (this.destinationHttpRequest.readyState === XMLHttpRequest.DONE) {
                //// debug console 
                // console.log(this.httpRequest.responseText);
                if (this.destinationHttpRequest.status === this.XMLHttpResponseStatus.OK) {
                    this.updateDestinationUISuccess(this.destinationHttpRequest.responseText);
                } 
            }
        },
        //// handle XHR success 
        updateUISuccess(responseText) {
            let response = JSON.parse(responseText);
            this.origin.placeId = response.results[0].place_id;
            this.origin.location.latitude = response.results[0].geometry.location.lat;
            this.origin.location.longtitude = response.results[0].geometry.location.lng;
            //// debug console 
            // console.log(response);
            // console.log(this.origin);
            //// get data includes location.lat, location.lng, and place_id  
            // console.log(response.results[0].place_id);
            // console.log(response.results[0].geometry.location);
            //var degC = degK - 273.15;	
            //var degCInt = Math.floor(degC);
            //var degF = degC * 1.8 + 32;
            //var degFInt = Math.floor(degF); 
        },
        updateDestinationUISuccess(responseText) {
            let response = JSON.parse(responseText);
            this.destination.placeId = response.results[0].place_id;
            this.destination.location.latitude = response.results[0].geometry.location.lat;
            this.destination.location.longtitude = response.results[0].geometry.location.lng;
            // debug
            //console.log(this.destination);
        },
        //// handle XHR error 
        updateUIError() {

        }
    }
})

var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 43.4553461, lng: -76.5104973},
        zoom: 8
    });
}

function showRoute() {
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();
    var routeOrigin = new google.maps.LatLng(vm.origin.location.latitude, vm.origin.location.longtitude);
    var routeDestination = new google.maps.LatLng(vm.destination.location.latitude, vm.destination.location.longtitude);
    var center = {
        lat: (vm.origin.location.latitude + vm.destination.location.latitude) / 2, 
        lng: (vm.origin.location.longtitude + vm.destination.location.longtitude) / 2
    }
    map = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 8
    });
    directionsDisplay.setMap(map);

    var request = {
        origin: routeOrigin,
        destination: routeDestination,
        travelMode: 'DRIVING'
    };
    directionsService.route(request, function (result, status) {
        // console.log(result, status);
        if (status === 'OK') {
            //// render direction
            directionsDisplay.setDirections(result);
        }
    })
}

// const XMLHttpResponseStatus = {
//     OK: 200,
//     BadRequest: 400,
//     Unauthorized: 401,
//     Forbidden: 403,
//     NotFound: 404
// };

// (function() {
//     // 5 day weather forecast
// 	// 5 day forecast is available at any location or city. It includes weather data every 3 hours.
// 	// http://api.openweathermap.org/data/2.5/forecast?q={city name},{country code}
//     let origin = "Oswego";
//     let countryCode = "US";
// 	let url = `http://api.openweathermap.org/data/2.5/forecast?q=${origin},${countryCode}`;
// 	let apiKey = "8a5ef2f6226eb0720aa8e36f2744ec83"; 
//     let httpRequest;
    
// 	makeRequest();

// 	// create and send an XHR request
// 	function makeRequest() {		
// 		httpRequest = new XMLHttpRequest();
// 		httpRequest.onreadystatechange = handleResponse;
// 		httpRequest.open('GET', url + '&appid=' + apiKey);
// 		httpRequest.send();
//     }
    
// 	// handle XHR response
// 	function handleResponse() {
// 		if (httpRequest.readyState === XMLHttpRequest.DONE) {
//             // debug console
//             console.log(httpRequest.responseText);
//             if (httpRequest.status === XMLHttpResponseStatus.OK) {
// 				updateUISuccess(httpRequest.responseText);
// 			} else {
// 				updateUIError();
// 			}
// 		}
//     }
    
//     // handle XHR success
// 	function updateUISuccess(responseText) {
//         let response = JSON.parse(responseText);
//         // debug console
//         console.log(response);
// 		//var degC = degK - 273.15;	
// 		//var degCInt = Math.floor(degC);
// 		//var degF = degC * 1.8 + 32;
// 		//var degFInt = Math.floor(degF);
// 	}

// 	// handle XHR error
// 	function updateUIError() {

// 	}

// })();