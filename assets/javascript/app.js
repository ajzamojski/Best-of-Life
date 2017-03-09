$(document).ready(function(){

	var googleAPI = "AIzaSyCisdCKvECDpmY8Cm1_GK6W2-8PhCDUobg";
	var topic = "";
	var coordinates = "";
	var chosenLat = "";
	var chosenLng = "";

	$("#submitTopic").on('click', function(event){
		event.preventDefault();

		topic = $("#searchInput").val().trim();
		var location = $("#locationInput").val().trim();
		console.log(topic);
		console.log(location);

		runGooglequery(location);

		return false;
	});

	function runGooglequery (location) 
	{	
		
		var addressRequest = "https://maps.googleapis.com/maps/api/geocode/json?address=" + location + "&key=" + googleAPI;
		$.ajax({
			url: addressRequest,
			method: "GET"

				}).done (function(response){
				console.log(response);

				var longitude = response.results[0].geometry.location.lng;
				console.log(longitude);
				var latitude = response.results[0].geometry.location.lat;
				console.log(latitude);

					coordinates = "&location=" + latitude + "," + longitude;

				initMap2(latitude, longitude);

				console.log(topic);

				var googleSearch = "https://maps.googleapis.com/maps/api/place/textsearch/json?query="+ topic + coordinates +"&key=" + googleAPI;
				console.log(googleSearch);

					$.ajax({
					url: googleSearch,
					method: "GET"

					}).done (function(finalResponse){
					console.log(finalResponse.results[0].geometry.location.lat);

					chosenLat = finalResponse.results[0].geometry.location.lat;
					chosenLng = finalResponse.results[0].geometry.location.lng;

					initMap2(chosenLat, chosenLng);

					});
			});

		console.log("hello");
	};

	function initMap2(latitude, longitude) {
	  var uluru = {lat: latitude, lng: longitude};
	  var map = new google.maps.Map(document.getElementById('map'), {
	    zoom: 15,
	    center: uluru
	  });
	  var marker = new google.maps.Marker({
	    position: uluru,
	    map: map
	  });
	};

});
function initMap(latitude, longitude) {
	  var uluru = {lat: -25.363, lng: 131.044};
	  var map = new google.maps.Map(document.getElementById('map'), {
	    zoom: 4,
	    center: uluru
	  });
	  var marker = new google.maps.Marker({
	    position: uluru,
	    map: map
	  });
	};


