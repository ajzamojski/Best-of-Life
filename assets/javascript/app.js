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

	    	if(!geoFlag)
	    	{
	    		drawMap(best.coordinates.latitude, best.coordinates.longitude, radius); 
	    	}
	    	addMarker(best, searchTerm);

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


function addMarker(bestData, searchTerm)
{
	
	var uluru = {lat: bestData.coordinates.latitude, lng: bestData.coordinates.longitude};

	var marker = new google.maps.Marker({
	    
	    position: uluru,
	    map: map

	    
	    //different icon TEST CODE
	    //icon:'assets/images/ribbon-sm.png',
	    //animation:google.maps.Animation.BOUNCE
	});//END marker


 
  	var infoWindowData = 
    	"<div class='infoWindow'>"+
	    	"<h1 class='infoHeading'>THE BEST "  + searchTerm.toUpperCase() + "</h1>" +
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
     
        
    var infowindow = new google.maps.InfoWindow({content: infoWindowData});

   	marker.addListener('click', function() {      

          infowindow.open(map, marker);
        });

}//END addMarker()


//==================================================================================


// Removes the markers from the map
// function clearMarkers()
// {
// 	setMapOnAll(null);
// }
//=================================== THE END =======================================

