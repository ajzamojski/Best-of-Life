/*			**************** NOTES *************************
							TO DO
	-----------------------------------------------------	
	Possible Issues:
		1.) New Search Keeps Previous Markers.
		2.) Inherent issue with yelp radius search. If business "service area" or "delivery area"
		is within your search radius. Business shows up in search.
		
	
	------------------------------------------------------		

		Validate Inputs.	
		Check if variable need to be global 

		Directions
			save current location.

*/

/*==============================================================================
================================ Variables ====================================
===============================================================================*/


var latitude;
var longitude;
var radius;
var postalCode;

//This is the map on the page.
var map; 
var geoFlag = false;


/*==============================================================================
================================ Functions ====================================
===============================================================================*/

$(document).ready(function()
{
	$("#googleMap").hide();
	
	$("#submitTopic").on('click', function(event){
		
		event.preventDefault();

		$("#googleMap").show();

		//NEED TO CHECK INPUTS FOR VALIDITY
		var searchTerm = $("#searchInput").val().trim();
		var locationInput = $("#locationInput").val().trim();        
		var radius = parseInt($("#radius").val());


		
		//if locationInput is blank, use zip from geolocation in search.
		if(locationInput === "")
		{
			place = postalCode;
			geoFlag = true;
		}
		else
		{
			place = locationInput;
			geoFlag = false;
		}
					
		queryYelp(searchTerm, place, radius);


	});//END #submitTopic.on("click")


	// Triggers modal for instructions
	$("#myBtn").click(function(){
        $("#myModal").modal();
    });

});//END document.ready


//========================================= runGoogle Query ===============================
	
	/*Yelp search query is sorted by 'rating' in which "The rating sort is not strictly sorted by 
	the rating value, but by an adjusted rating value that takes into account the number of 
	ratings, similar to a bayesian average. This is so a business with 1 rating of 5 stars 
	doesn’t immediately jump to the top.". 
	*/
	function queryYelp(searchTerm, place, radius) 
	{	

		const YELP_HEROKU_ENDPOINT = "https://floating-fortress-53764.herokuapp.com/"

		var queryURL = YELP_HEROKU_ENDPOINT + "?term=" + searchTerm + "&location="+ place + "&radius="+ radiusToMeters(radius);
	
		console.log("queryURL: " + queryURL);

		$.ajax({
		      url: queryURL,
		      method: "GET"
	    }).done(function(response) {

	    	var yelpBusinessesArray = JSON.parse(response).businesses;

	    	//contains object data of first element 'best' in response.businesses
	    	var best = yelpBusinessesArray[0];
	    	var secondBest = yelpBusinessesArray[1];
	    	var thirdBest = yelpBusinessesArray[2];

	    	if(!geoFlag)
	    	{
	    		drawMap(best.coordinates.latitude, best.coordinates.longitude, radius); 
	    	}
	    	addMarker(best, secondBest, thirdBest, searchTerm);

	    });
	}//END queryYelp()
//============================= drawMap =============================================


// Use Google Maps API to display a map of given parameters.
function drawMap(latitude, longitude, radius) 
{	
	var uluru = {lat: latitude, lng: longitude};
	
	var zoom = radiusToZoom(radius);

	
	map = new google.maps.Map(document.getElementById('googleMap'),
	{
		zoom: zoom,
		center: uluru
	});

}//END drawMap()

//============================= drawMap =============================================

//When page first loads this is called via <script> tag in html.
//Initally generic map is displayed of center USA showing whole country.
//If geolocation is detected map is displayed based on that location
//with a radius of about 5 miles.
function initMap() 
{

	//Inital map displayed coordinates of center of US.
	latitude = 39.8282;
	longitude = -98.5795;
	radius = 1000;
	drawMap(latitude, longitude, radius);

	//If goeloaction is detected display map of users locaction.
	if(navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(function(position)
		{
			latitude = position.coords.latitude;
          	longitude = position.coords.longitude;
          	radius = 5;
          	revGeoCode();
          	drawMap(latitude, longitude, radius);          
        });  
    }    

}//END initMap()

//=============================================================

//Converts radius in miles to approx zoom #
function radiusToZoom(radius)
{
    return Math.round(14-Math.log(radius)/Math.LN2);
}

//=============================================================

//Converts miles to meters for radius
function radiusToMeters(radius)
{
	return parseInt((radius * 1000)/.62);
}

//====================================================================

//====================================================================

//Used Google API geocode to return a zip code from latitue and longitude.
function revGeoCode()
{

	const GOOGLE_GEOCODE_ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
	const GOOGLE_API_KEY = "&key=AIzaSyDr-DLJtSliHGOsZhoI76ETn6jsk8kVYGo";
	
	//corrdinates string used in endpoint from latitude and longitude
	var coordinates = latitude + "," + longitude;

	//REVERSE GEOCODE LOOK UP 
	var geocodeUrl = GOOGLE_GEOCODE_ENDPOINT + coordinates + "&result_type=postal_code" + GOOGLE_API_KEY;

	$.ajax(
	{
		url: geocodeUrl,
		method: "GET"

	})
	.done (function(response)
	{			
		postalCode = response.results[0].address_components[0].long_name;					
	});//END ajax geocodeUrl
		
}// END revGeoCode()

//=============================================================================


function addMarker(bestData, secondBest, thirdBest, searchTerm)
{
	
	var uluru = {lat: bestData.coordinates.latitude, lng: bestData.coordinates.longitude};
	var uluru2 = {lat: secondBest.coordinates.latitude, lng: secondBest.coordinates.longitude};
	var uluru3 = {lat: thirdBest.coordinates.latitude, lng: thirdBest.coordinates.longitude};

	var image1 = {
		url: 'assets/images/Ribbon_1.png',
		size: new google.maps.Size(71, 71),
	    scaledSize: new google.maps.Size(30, 50)
	};

	var image2 = {
		url: 'assets/images/Ribbon_2.png',
		size: new google.maps.Size(71, 71),
	    scaledSize: new google.maps.Size(30, 50)
	};

	var image3 = {
		url: 'assets/images/Ribbon_3.png',
		size: new google.maps.Size(71, 71),
	    scaledSize: new google.maps.Size(30, 50)
	};

	var marker = new google.maps.Marker({
	   
	    position: uluru,
	    map: map,
	    icon: image1,
	    animation: google.maps.Animation.DROP
	    

	    
	    //different icon TEST CODE
	    //icon:'assets/images/ribbon-sm.png',
	    //animation:google.maps.Animation.BOUNCE
	});//END marker
	var marker2 = new google.maps.Marker({
	    
	    position: uluru2,
	    map: map,
	    icon: image2,
	    animation: google.maps.Animation.DROP

	});
	var marker3 = new google.maps.Marker({
	    
	    position: uluru3,
	    map: map,
	    icon: image3,
	    animation: google.maps.Animation.DROP

	});

  	var infoWindowData = 
    	"<div class='infoWindow'>"+
	    	"<h1 class='infoHeading'>The BEST "  + "'" + searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase() + "'" + "</h1>" +
	    	"<br>" +
	    	"<address class='infoAddress'>" +
	     		"<h3 class='infoName'>" + bestData.name + "</h3>"+
	     		bestData.location.display_address[0] + "<br>" +
	    		bestData.location.display_address[1] + "<br>" +
	     		bestData.display_phone + "</p>" +   	    		
	   			"<p>" + 
	   				"<a href=" + bestData.url + ">" + "Visit On Yelp</a>" + 
	   			"</p>" +
	   		"</address>"+	
		"</div>";

	var infoWindowData2 = 
    	"<div class='infoWindow'>"+
	    	"<h1 class='infoHeading'>The Second Best "  + "'" + searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase() + "'" + "</h1>" +
	    	"<br>" +
	    	"<address class='infoAddress'>" +
	     		"<h3 class='infoName'>" + secondBest.name + "</h3>"+
	     		secondBest.location.display_address[0] + "<br>" +
	    		secondBest.location.display_address[1] + "<br>" +
	     		secondBest.display_phone + "</p>" +   	    		
	   			"<p>" + 
	   				"<a href=" + secondBest.url + ">" + "Visit On Yelp</a>" + 
	   			"</p>" +
	   		"</address>"+	
		"</div>";

	var infoWindowData3 = 
    	"<div class='infoWindow'>"+
	    	"<h1 class='infoHeading'>The Third Best "  + "'" + searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase() + "'" + "</h1>" +
	    	"<br>" +
	    	"<address class='infoAddress'>" +
	     		"<h3 class='infoName'>" + thirdBest.name + "</h3>"+
	     		thirdBest.location.display_address[0] + "<br>" +
	    		thirdBest.location.display_address[1] + "<br>" +
	     		thirdBest.display_phone + "</p>" +   	    		
	   			"<p>" + 
	   				"<a href=" + thirdBest.url + ">" + "Visit On Yelp</a>" + 
	   			"</p>" +
	   		"</address>"+	
		"</div>";

    var infowindow = new google.maps.InfoWindow({content: infoWindowData});

   		marker.addListener('click', function() {   

   			infowindow2.close(map, marker2);
   			infowindow3.close(map, marker3);
          	infowindow.open(map, marker);
    });

   	var infowindow2 = new google.maps.InfoWindow({content: infoWindowData2});

   		marker2.addListener('click', function() {      
   			infowindow.close(map, marker);
   			infowindow3.close(map, marker3);
          	infowindow2.open(map, marker2);
    });

   	var infowindow3 = new google.maps.InfoWindow({content: infoWindowData3});

   		marker3.addListener('click', function() {      
   			infowindow.close(map, marker);
   			infowindow2.close(map, marker2);
          	infowindow3.open(map, marker3);
    });


}//END addMarker()


//==================================================================================


// Removes the markers from the map
// function clearMarkers()
// {
// 	setMapOnAll(null);
// }
//=================================== THE END =======================================

