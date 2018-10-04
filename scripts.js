"use strict";

let vm = new Vue({
    el: '#vue-root', 
    data: {
        cityName: '',
        countryCode: 'US',
        apiKey: "8a5ef2f6226eb0720aa8e36f2744ec83",
        httpRequest: null,
        XMLHttpResponseStatus: {
            OK: 200,
            BadRequest: 400,
            Unauthorized: 401,
            Forbidden: 403,
            NotFound: 404
        }
    },
    computed: {
        url() {
            return `http://api.openweathermap.org/data/2.5/forecast?q=${this.cityName},${this.countryCode}`;
        }
    },
    methods: {
        makeRequest() {
            this.httpRequest = new XMLHttpRequest();
		    this.httpRequest.onreadystatechange = this.handleResponse;
		    this.httpRequest.open('GET', this.url + '&appid=' + this.apiKey);
            this.httpRequest.send();
        },
        // handle XHR response
	    handleResponse() {
            if (this.httpRequest.readyState === XMLHttpRequest.DONE) {
                // debug console
                //console.log(this.httpRequest.responseText);
                if (this.httpRequest.status === this.XMLHttpResponseStatus.OK) {
                    this.updateUISuccess(this.httpRequest.responseText);
                } else {
                    this.updateUIError();
                }
            }
        },
        // handle XHR success
        updateUISuccess(responseText) {
            let response = JSON.parse(responseText);
            // debug console
            console.log(response);
            //var degC = degK - 273.15;	
            //var degCInt = Math.floor(degC);
            //var degF = degC * 1.8 + 32;
            //var degFInt = Math.floor(degF);
        },
        // handle XHR error
        updateUIError() {

        }
    }
})


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
//     let cityName = "Oswego";
//     let countryCode = "US";
// 	let url = `http://api.openweathermap.org/data/2.5/forecast?q=${cityName},${countryCode}`;
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