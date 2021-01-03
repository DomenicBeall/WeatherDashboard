// Get and store some of the more regularly accessed divs, for readability more than efficiency
var fiveDayForecastDiv = $("#forecast-cards");
var searchHistoryListDiv = $("#search-history");
var uvIndexDiv = $("#uvIndexDiv");

// Stores the key to the weather API
const API_KEY = "be99c505fb2b5702ed4d54b0b89dda7b";


init();

// Runs when the page is first loaded
function init() {
    
    // Add a click event listener to the search button
    $("#searchButton").click(searchCityWeather);

    // Hide all of the information divs so it doesn't look terrible
    $("#weatherInformation").hide();
    $("#5DayDiv").hide();
    $("#wicon").hide();

    // Render any search history in local storage
    renderSearchHistory();
}

// Gets and displays weather data for the city in the search field
function searchCityWeather() {
    // Assign a variable to the selected city name
    var cityName = $("#cityInput").val();

    // Store the url to be queried
    var url = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + API_KEY;

    // Send an ajax request getting the weather information
    $.ajax({
        type: "GET", 
        url: url,
        
        // This function is ran if the ajax request succeeds
        success: function(response) {

            // Show the weather information divs
            $("#weatherInformation").show(1000);
            $("#5DayDiv").show(1000);
            $("#wicon").show(1000);

            // Add the search city to the search history
            addCityToSearchHistory(cityName);

            // Get the date and format it into something readable
            var date = new Date(response.dt * 1000);
            var formattedDate = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();

            // Put information in the relevant divs
            $("#cityNameDiv").text(response.name + " (" + formattedDate + ")");
            $("#temperatureDiv").text(response.main.temp + " °F");
            $("#humidityDiv").text(response.main.humidity + "%");
            $("#windSpeedDiv").text(response.wind.speed + " MPH");
            
            // Get the weather icon url and set it to the src of the icon div
            var iconcode = response.weather[0].icon;
            var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
            $('#wicon').attr('src', iconurl);

            // Store the url to be queried for UV information
            var uvUrl = "http://api.openweathermap.org/data/2.5/uvi?lat=" + response.coord.lat + "&lon=" + response.coord.lon + "&appid=" + API_KEY;

            // Send an AJAX request to get UV information
            $.ajax(uvUrl).then(function(response) {

                // Store the uv returned
                var uvValue = response.value;
                
                // Display the UV value
                uvIndexDiv.text(uvValue);
                
                // Change the color of the UV div depending on the severity of the UV
                if (uvValue >= 8)
                    uvIndexDiv.css("background-color", "red");
                else if (uvValue >= 6)
                    uvIndexDiv.css("background-color", "orange");
                else if (uvValue >= 3)
                    uvIndexDiv.css("background-color", "yellow");
                else
                    uvIndexDiv.css("background-color", "green");
            });
        },

        // This function runs if the ajax request returns an error
        error : function (xhr, ajaxOptions, thrownError) {

            // Clear all of the weather information divs
            $("#cityNameDiv").text("We couldn't find a city with the name: \"" + cityName + "\"");
            $("#weatherInformation").hide();
            $("#5DayDiv").hide();
            $("#wicon").hide();
        }
    });

    // Store the URL for the five day forecast API
    var fiveDayUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=" + API_KEY;

    // Send an AJAX request to the five day forecast API
    $.ajax({
        type: "GET", 
        url: fiveDayUrl, 

        // This function is executed if the request is successful
        success: function(response) {

            // Clear the old cards from the 5 day forecast div
            fiveDayForecastDiv.empty();

            // Stores a list of the weather every 3 hours for the next 5 days
            var weatherList = response.list;
            
            // Loop 5 times
            for (let i = 0; i < 5; i++) {
                /* 
                Clarification: Because the 5 day forecast API returns an array of the weather every 3 hours
                for the next 5 days the weatherList actually has 40 entries.

                The index variable is equal to i * 8 + 4, because this gives the entry from 12 o'clock on 
                each day.
                */
                var index = (i * 8) + 4;
                
                // Generate a card for each of the 5 days and display all of the relevant information and an icon
                var cardContainer = $("<div class=\"card d-inline-flex\" style=\"width: 15%; margin-right: 10px;\">");
                var cardBody = $("<div class=\"card-body\">");                
                var cardDate = $("<h5 class=\"card-title\">" + weatherList[index].dt_txt.split(" ")[0] + "</h5>");
                var iconcode = weatherList[index].weather[0].icon;
                var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
                var cardIcon = $("<div><img id=\"wicon\" src=\"" + iconurl + "\"></div>");
                var cardTemp = $("<p class=\"card-text\">" + weatherList[index].main.temp + " °F</p>");
                var cardHumidity = $("<p class=\"card-text\">" + weatherList[index].main.humidity + "%</p>");
    
                // Append all of the elements to the card and the card to the fiveDayForecast parent div
                cardBody.append(cardDate);
                cardBody.append(cardIcon);
                cardBody.append(cardTemp);
                cardBody.append(cardHumidity);
                cardContainer.append(cardBody);
                fiveDayForecastDiv.append(cardContainer);
            }
        }
    });
}

// Adds a city to the search history and saves the history to local storage
function addCityToSearchHistory(cityName) {
    
    // Declare a variable to store the search history
    var searchHistory = [];

    // Get any search history already stored in local storage
    if (localStorage.getItem("searchHistory"))
        searchHistory = JSON.parse(localStorage.getItem("searchHistory")).searchHistory;

    // Check if the city being added is already in the search history, otherwise...
    if (!searchHistory.includes(cityName)) {

        // Add the city to the beginning of the search history
        searchHistory.unshift(cityName);

        // Cut the history to a length of 5, so it doesn't get too long
        searchHistory.length = 5;

        // Put the history inside an object
        var jsonHistory = { searchHistory : searchHistory };
    
        // Store that object in the local storage
        localStorage.setItem("searchHistory", JSON.stringify(jsonHistory));
        
        // Render the new search history
        renderSearchHistory();   
    }
}

// Renders a list of previous search options
function renderSearchHistory() {
    // Clear old search history divs
    searchHistoryListDiv.empty();

    // Declare the search history and search local storage to find previous entries
    var searchHistory = [];

    if (localStorage.getItem("searchHistory"))
        searchHistory = JSON.parse(localStorage.getItem("searchHistory")).searchHistory;

    // Generate a list button for each city in the search history
    for (let i = 0; i < searchHistory.length; i++) {
        var liDiv = $("<li class=\"list-group-item list-group-item-action\" data-value=\"" + searchHistory[i] + "\">" + searchHistory[i] + "</li>");
        
        liDiv.click(function(event) {
            $("#cityInput").val(event.currentTarget.dataset.value);
            searchCityWeather();
        });
        
        searchHistoryListDiv.append(liDiv);
    }

}