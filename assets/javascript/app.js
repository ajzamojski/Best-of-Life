/*	
	What Doug Updated
		
	Changed API key in runGoogleQuery so they all use the same one.

	removed 'place' variable changed to 'location'

	changed most global varibles to local ones.

	removed default lat, long, radius values along with drawMap() calls in initmap.
	
	removed geoFlag and if statments from submit click & runGooglequery
	
	Cleaned up code a bit.
*/


/*==============================================================================
================================ Variables ====================================
===============================================================================*/

//Constant containing Google API key.
const GOOGLE_API_KEY = "&key=AIzaSyDr-DLJtSliHGOsZhoI76ETn6jsk8kVYGo";

//This is the map on the page.
var map; 

//Array used for map markers.
var markersArray=[];

/*==============================================================================
================================ Functions ====================================
===============================================================================*/

$(document).ready(function()
{
	//replaced this with display: none; in css -doug
	// $("#googleMap").hide();

	//prevent unwanted characters from being entered in 'Search Topic' input box
	 $(function () 
	 {
		$('#searchInput').keydown(function (e) 
		{				
			var key = e.keyCode;
			
			if (!((key == 8) || (key == 9) ||(key == 32) || (key == 46) || (key >= 35 && key <= 40) || (key >= 65 && key <= 90)))
			{
			 	e.preventDefault();
			}
		
		});
	 });//END prevent numbers

    //prevent unwanted characters from being entered in 'Location' input box
    $(function () 
    {
    	$('#locationInput').keydown(function (e)     	
   		{
   			 var key = e.keyCode;
   			 if (!((key == 8) || (key == 9) || (key == 32) || (key == 188)|| (key == 46) || (key >= 35 && key <= 40) || (key >= 48 && key <= 105))) 
   			 {
    			e.preventDefault();
   			 }   	
    	});
    }); 
	
	$("#submitTopic").on('click', function(event){
		
		event.preventDefault();

		$("#googleMap").show();

		//Clears markers from map.
		deleteMarkers(); 

		//NEED TO CHECK INPUTS FOR VALIDITY
		var searchTerm = $("#searchInput").val().trim();
		var locationInput = $("#locationInput").val().trim();        
		
		//Gets radius from user in miles and converts to meters.
		var radius = radiusToMeters(parseInt($("#radius").val()));
		
		runGooglequery(searchTerm, locationInput, radius);			

		$("#searchInput").val("");

	});//END #submitTopic.on("click")


	// Triggers modal for instructions
	$("#instructionsBtn").click(function(){
        $("#instructionsModal").modal();
    });
    $("#howItWorksBtn").click(function(){
        $("#howItWorksModal").modal();
    });
    $("#examplesBtn").click(function(){
        $("#examplesModal").modal();
    });

});//END document.ready

// runGooglequery is called to get the location of the city entered and use its coordinate as a center point 
// when the map is drawn.
function runGooglequery (searchTerm, location, radius) 
{	
	
	var addressRequest = "https://maps.googleapis.com/maps/api/geocode/json?address=" + location + "&key=" + GOOGLE_API_KEY;
	$.ajax({
		url: addressRequest,
		method: "GET"

			}).done (function(response){
console.log(response);//TEST CODE REMOVE

			var cityLatitude = response.results[0].geometry.location.lat;
console.log("cityLat: " + cityLatitude);//TEST CODE REMOVE
			var cityLongitude = response.results[0].geometry.location.lng;
console.log("cityLong: " + cityLongitude);//TEST CODE REMOVE
    	
    		drawMap(cityLatitude, cityLongitude, radius); 
    	
			queryYelp(searchTerm, location, radius);
		});
};
//========================================= runGoogle Query ===============================
	
	/*Yelp search query is sorted by 'rating' in which "The rating sort is not strictly sorted by 
	the rating value, but by an adjusted rating value that takes into account the number of 
	ratings, similar to a bayesian average. This is so a business with 1 rating of 5 stars 
	doesn’t immediately jump to the top.". 
	*/
	function queryYelp(searchTerm, location, radius)
	{	
console.log("queryYelp searchTerm: " + searchTerm);//TEST CODE REMOVE	
console.log("queryYelp place: " + location);//TEST CODE REMOVE	
console.log("queryYelp radius: " + radius);//TEST CODE REMOVE	
		
		const YELP_HEROKU_ENDPOINT = "https://floating-fortress-53764.herokuapp.com/"

		var queryURL = YELP_HEROKU_ENDPOINT + "?term=" + searchTerm + "&location="+ location + "&radius="+ radius;
	
console.log("queryURL: " + queryURL);//TEST CODE REMOVE

		$.ajax({
		      url: queryURL,
		      method: "GET"
	    }).done(function(response) {

	    	//Array of all busnisesses from Yelp query
	    	var yelpResults = JSON.parse(response).businesses;

	    	if (yelpResults[0] === undefined)
	    	{	    		
	    		$("#span-searchTerm").html(searchTerm);
	    		$("#noResults").modal();
	    		$("#searchInput").val("");
	    		return;
	    	}

console.log(yelpResults);//TEST CODE REMOVE
 	
	    	addMarker(yelpResults, searchTerm);

	    });
	}//END queryYelp()
//============================= drawMap =============================================


// Use Google Maps API to display a map of given parameters.
function drawMap(latitude, longitude, radius) 
{	
console.log("hello5");//TEST CODE REMOVE
	
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
//If geolocation is detected, revGeoCode populates 'location' input 
//with zip of geolocation.

function initMap() 
{

console.log("hello4");//TEST CODE REMOVE
	
	if(navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(function(position)
		{
			var latitude = position.coords.latitude;
          	var longitude = position.coords.longitude;
          	revGeoCode(latitude, longitude);
        });  
    }    

}//END initMap()

//=============================================================

//Converts radius in miles to approx zoom #
function radiusToZoom(radius)
{
console.log("hello2");//TEST CODE REMOVE
    
    return Math.round(14-Math.log((radius*.62)/1000)/Math.LN2);
}

//=============================================================

//Converts miles to meters for radius
function radiusToMeters(radius)
{

console.log("hello3");//TEST CODE REMOVE
	
	return parseInt((radius * 1000)/.62);
}

//====================================================================

//Used Google API geocode to return a zip code from latitue and longitude.
function revGeoCode(latitude, longitude)
{

console.log("hello6");//TEST CODE REMOVE
	
	const GOOGLE_GEOCODE_ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
	
	
	//corrdinates string used in endpoint from latitude and longitude
	var coordinates = latitude + "," + longitude;

console.log(coordinates);//TEST CODE REMOVE

	//REVERSE GEOCODE LOOK UP 
	var geocodeUrl = GOOGLE_GEOCODE_ENDPOINT + coordinates + "&result_type=postal_code" + GOOGLE_API_KEY;

	$.ajax(
	{
		url: geocodeUrl,
		method: "GET"

	})
	.done (function(response)
	{			
		var zipCode = response.results[0].address_components[0].long_name;

		//Populates 'location' input box with golocation zip code 
		$("#locationInput").val(zipCode);	

console.log(zipCode);//TEST CODE REMOVE				
	
	});//END ajax geocodeUrl
		
}// END revGeoCode()

//=============================================================================



//
function addMarker(yelpResults, searchTerm)
{
	console.log("hello1");//TEST CODE REMOVE	

	var icons = ["assets/images/Ribbon_1.png","assets/images/Ribbon_2.png","assets/images/Ribbon_3.png"];


	for (var i = 0; i < 3; i++)
	{
		if (yelpResults[i] !== undefined)
		{	
			var uluru = {
				lat: yelpResults[i].coordinates.latitude,
				lng: yelpResults[i].coordinates.longitude
			};
		
			var icon = {
				url: icons[i],
				size: new google.maps.Size(71, 71),
		   		scaledSize: new google.maps.Size(30, 50)
			};

			var marker = new google.maps.Marker({
	   
			    position: uluru,
			    map: map,
			    icon: icon,
			    animation: google.maps.Animation.DROP
			    
			});

			markersArray.push(marker);
				
			marker.content = 
	    	"<div class='infoWindow'>"+
		    	"<h1 class='infoHeading'>The BEST "  + searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase() + "</h1>" +
		    	"<address class='infoAddress'>" +
		     		"<h3 class='infoName'>" + yelpResults[i].name + "</h3>"+
		     		yelpResults[i].location.address1 + "<br>" +
		    		yelpResults[i].location.city + ", " + yelpResults[i].location.state + 
		    		" " + yelpResults[i].location.zip_code + 
		    		"<br>" +
		     		yelpResults[i].display_phone + "</p>" +   	    		
		   			"<p>" + 
		   				"<a href=" + yelpResults[i].url + ">" + "Visit On Yelp</a>" + 
		   			"</p>" +
		   		"</address>"+	
			"</div>";

			var infoWindow = new google.maps.InfoWindow();
			google.maps.event.addListener(marker, 'click', function () 
			{
                infoWindow.setContent(this.content);
                infoWindow.open(this.getMap(), this);
            });

		}//END if
	
	}//END for

}//END addMarker()


//==================================================================================
   
// Deletes all markers in the array by removing references to them.
function deleteMarkers() 
{
	for (var i = 0; i < markersArray.length; i++)
	{
	  markersArray[i].setMap(null);
	}
	markersArray = [];
}//END deleteMarkers()
//=================================== THE END =======================================