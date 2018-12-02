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
        originWeatherHttpRequest: null,
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
            // return `http://api.openweathermap.org/data/2.5/forecast?q=${this.origin.placeName},${this.countryCode}`;
            return `https://api.openweathermap.org/data/2.5/weather?`;
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
            this.originWeatherHttpRequest = new XMLHttpRequest();
            this.originWeatherHttpRequest.onreadystatechange = this.handleOriginWeatherResponse;
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
            

            // focus on show route
            document.getElementById("showRoute").focus();

        },

        handleOriginWeatherResponse () {
            if (this.originWeatherHttpRequest.readyState === XMLHttpRequest.DONE) {
                //// debug console 
                //console.log(this.originWeatherHttpRequest.responseText);
                if (this.originWeatherHttpRequest.status === this.XMLHttpResponseStatus.OK) {
                    //console.log(JSON.parse(this.originWeatherHttpRequest.responseText)["weather"][0]["description"]);
                } else {
                    
                }
            }
            // console.log('test');
        },

        //// handle XHR response 
	    handleResponse() {
            if (this.originHttpRequest.readyState === XMLHttpRequest.DONE) {
                //// debug console 
                //console.log(this.originHttpRequest.responseText);
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
            // get data includes location.lat, location.lng, and place_id  
            //console.log(response.results[0].place_id);
            // console.log('origin:');
            // console.log('place id: ' + response.results[0].place_id);
            // console.log('lat:' + typeof(response.results[0].geometry.location.lat));
            // console.log('lng:' + response.results[0].geometry.location.lng);
            
            // var weatherHttpRequest = new XMLHttpRequest();
            
            this.originWeatherHttpRequest.open('GET', this.weatherUrl + 'lat=' + this.origin.location.latitude + '&lon=' + this.origin.location.longtitude + '&appid=' + this.weatherApiKey);
            this.originWeatherHttpRequest.send();

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
            // console.log('destination:');
            // console.log('place id: ' + response.results[0].place_id);
            // console.log('lat:' + response.results[0].geometry.location.lat);
            // console.log('lng:' + response.results[0].geometry.location.lng);

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
    //// reference: https://www.youtube.com/watch?v=QuuL29iiOn0
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
            for (let i = 0; i < result.routes[0].legs[0].steps.length; i++) {
                //// get origin geocoding data 
                let relayWeatherRequest = new XMLHttpRequest();
                relayWeatherRequest.onreadystatechange = (function(m) {
                    return function () {
                        if (relayWeatherRequest.readyState === XMLHttpRequest.DONE) {
                            //// debug console 
                            // console.log(relayWeatherRequest.responseText);
                            if (relayWeatherRequest.status === vm.XMLHttpResponseStatus.OK) {
                                //console.log(JSON.parse(relayWeatherRequest.responseText)["weather"][0]["description"]);
                                var weatherDescription = JSON.parse(relayWeatherRequest.responseText)["weather"][0]["description"];
                                
                                var relayMarker = new google.maps.Marker({
                                    position: new google.maps.LatLng(
                                        Number(result.routes[0].legs[0].steps[i].start_location.lat()),
                                        Number(result.routes[0].legs[0].steps[i].start_location.lng())
                                    ),
                                    icon: {url: weatherDescriptionToIcon[weatherDescription], scaledSize: new google.maps.Size(40, 40)},
                                    map: m
                                });
                                // console.log('relay ' + i);
                                // console.log(relayMarker.position.lat());
                                // console.log(relayMarker.position.lng());

                                relayMarker.setMap(m);
                            } else {
                                
                            }
                        }
                    }
                })(map);

                relayWeatherRequest.open('GET', vm.weatherUrl + 
                                                'lat=' + result.routes[0].legs[0].steps[i].start_location.lat() + 
                                                '&lon=' + result.routes[0].legs[0].steps[i].start_location.lng() + 
                                                '&appid=' + vm.weatherApiKey);
                relayWeatherRequest.send();


                // let relayMarker = new google.maps.Marker({
                //     position: new google.maps.LatLng(
                //         Number(result.routes[0].legs[0].steps[i].start_location.lat()),
                //         Number(result.routes[0].legs[0].steps[i].start_location.lng())
                //     ),
                //     map: map
                // });
                // console.log('relay ' + i);
                // console.log(relayMarker.position.lat());
                // console.log(relayMarker.position.lng());

                // var relayEndMarker = new google.maps.Marker({
                //     position: new google.maps.LatLng(
                //         Number(result.routes[0].legs[0].steps[i].end_location.lat()),
                //         Number(result.routes[0].legs[0].steps[i].end_location.lng())
                //     ),
                //     map: map
                // })
                // relayMarker.position = {
                //     lat: Number(result.routes[0].legs[0].steps[i].start_location.lat()),
                //     lng: Number(result.routes[0].legs[0].steps[i].start_location.lng())
                // }
                // To add the marker to the map, call setMap();
                // relayMarker.setMap(map);
                //relayEndMarker.setMap(map);
                // console.log(relayMarker.position.lat);
                // console.log(typeof(relayMarker.position.lat));
                // console.log(result.routes[0].legs[0].steps[i].start_location);
            }
            //console.log(result);
            // console.log(result.routes[0].legs[0].steps[10].start_location.lng());
        }
    })
}

var iconBase = 'images/icons/';
var weatherDescriptionToIcon = {
    "clear sky": iconBase + 'd-clear-sky.png',
    "few clouds": iconBase + 'd-few-clouds.png',
    "scattered clouds": iconBase + 'd-scattered-clouds.png',
    "overcast clouds": iconBase + 'd-broken-clouds.png',
    "broken clouds": iconBase + 'd-broken-clouds.png',
    "shower rain": iconBase + 'd-shower-rain.png',
    "light intensity drizzle": iconBase + 'd-shower-rain.png',
    "drizzle": iconBase + 'd-shower-rain.png',
    "heavy intensity drizzle": iconBase + 'd-shower-rain.png',
    "light intensity drizzle rain": iconBase + 'd-shower-rain.png',
    "drizzle rain": iconBase + 'd-shower-rain.png',
    "heavy intensity drizzle rain": iconBase + 'd-shower-rain.png',
    "shower rain and drizzle": iconBase + 'd-shower-rain.png',
    "heavy shower rain and drizzle": iconBase + 'd-shower-rain.png',
    "shower drizzle": iconBase + 'd-shower-rain.png',
    "rain": iconBase + 'd-rain.png',
    "light rain": iconBase + 'd-rain.png',
    "moderate rain": iconBase + 'd-rain.png',
    "heavy intensity rain": iconBase + 'd-rain.png',
    "very heavy rain": iconBase + 'd-rain.png',
    "extreme rain": iconBase + 'd-rain.png',
    "freezing rain": iconBase + 'd-rain.png',
    "light intensity shower rain": iconBase + 'd-rain.png',
    "shower rain": iconBase + 'd-rain.png',
    "heavy intensity shower rain": iconBase + 'd-rain.png',
    "ragged shower rain": iconBase + 'd-rain.png',
    "thunderstorm": iconBase + 'd-thunderstorm.png',
    "thunderstorm with light rain": iconBase + 'd-thunderstorm.png',
    "thunderstorm with rain": iconBase + 'd-thunderstorm.png',
    "thunderstorm with heavy rain": iconBase + 'd-thunderstorm.png',
    "light thunderstorm": iconBase + 'd-thunderstorm.png',
    "heavy thunderstorm": iconBase + 'd-thunderstorm.png',
    "ragged thunderstorm": iconBase + 'd-thunderstorm.png',
    "thunderstorm with light drizzle": iconBase + 'd-thunderstorm.png',
    "thunderstorm with drizzle": iconBase + 'd-thunderstorm.png',
    "thunderstorm with heavy drizzle": iconBase + 'd-thunderstorm.png',
    "snow": iconBase + 'd-snow.png',
    "light snow": iconBase + 'd-snow.png',
    "heavy snow": iconBase + 'd-snow.png',
    "sleet": iconBase + 'd-snow.png',
    "shower sleet": iconBase + 'd-snow.png',
    "light rain and snow": iconBase + 'd-snow.png',
    "rain and snow": iconBase + 'd-snow.png',
    "light shower snow": iconBase + 'd-snow.png',
    "shower snow": iconBase + 'd-snow.png',
    "heavy shower snow": iconBase + 'd-snow.png',
    "mist": iconBase + 'd-mist.png',
    "smoke": iconBase + 'd-mist.png',
    "haze": iconBase + 'd-mist.png',
    "sand, dust whirls": iconBase + 'd-mist.png',
    "fog": iconBase + 'd-mist.png',
    "sand": iconBase + 'd-mist.png',
    "dust": iconBase + 'd-mist.png',
    "volcanic ash": iconBase + 'd-mist.png',
    "squalls": iconBase + 'd-mist.png',
    "tornado": iconBase + 'd-mist.png'
}

// var icons = {
//     sun: iconBase + 'sun.svg',
//     clouds: iconBase + 'clouds.svg',
//     rainy: iconBase + 'raindrop.svg',
//     snowy: iconBase + 'snowflake.svg',
//     storm: iconBase + 'storm.svg',
//     moon: iconBase + 'moon.svg'
// }

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