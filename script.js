// Get and store some of the more regularly accessed divs, for readability more than efficiency
var fiveDayForecastDiv = $("#forecast-cards");
var searchHistoryListDiv = $("#search-history");
var uvIndexDiv = $("#uvIndexDiv");

// Stores the key to the weather API
const API_KEY = "be99c505fb2b5702ed4d54b0b89dda7b";


init();

// Adds an event listener to the search button and renders the search history
function init() {
    $("#searchButton").click(searchCityWeather);
    $("#weatherInformation").hide();
    $("#5DayDiv").hide();
    $("#wicon").hide();

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
            $("#weatherInformation").show();
            $("#5DayDiv").show();
            $("#wicon").show();

            addCityToSearchHistory(cityName);

            var date = new Date(response.dt * 1000);
            var formattedDate = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();

            $("#cityNameDiv").text(response.name + " (" + formattedDate + ")");
            $("#temperatureDiv").text(response.main.temp + " °F");
            $("#humidityDiv").text(response.main.humidity + "%");
            $("#windSpeedDiv").text(response.wind.speed + " MPH");

            var iconcode = response.weather[0].icon;
            var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
            $('#wicon').attr('src', iconurl);

            var uvUrl = "http://api.openweathermap.org/data/2.5/uvi?lat=" + response.coord.lat + "&lon=" + response.coord.lon + "&appid=" + API_KEY;

            $.ajax(uvUrl).then(function(response) {
                var uvValue = response.value;
                
                uvIndexDiv.text(uvValue);
                
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

    // Five day forecast
    var fiveDayUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=" + API_KEY;

    $.ajax({
        type: "GET", 
        url: fiveDayUrl, 
        success: function(response) {
            fiveDayForecastDiv.empty();

            var weatherList = response.list;
    
            for (let i = 0; i < 5; i++) {
                var index = (i * 8) + 4;
                
                var cardContainer = $("<div class=\"card d-inline-flex\" style=\"width: 15%; margin-right: 10px;\">");
                var cardBody = $("<div class=\"card-body\">");
                var cardDate = $("<h5 class=\"card-title\">" + weatherList[index].dt_txt.split(" ")[0] + "</h5>");

                var iconcode = weatherList[index].weather[0].icon;
                var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
                var cardIcon = $("<div><img id=\"wicon\" src=\"" + iconurl + "\"></div>");

                var cardTemp = $("<p class=\"card-text\">" + weatherList[index].main.temp + " °F</p>");
                var cardHumidity = $("<p class=\"card-text\">" + weatherList[index].main.humidity + "%</p>");
    
                
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

function addCityToSearchHistory(cityName) {
    var searchHistory = [];

    if (localStorage.getItem("searchHistory"))
        searchHistory = JSON.parse(localStorage.getItem("searchHistory")).searchHistory;

    if (!searchHistory.includes(cityName)) {
        searchHistory.unshift(cityName);

        searchHistory.length = 5;

        var jsonHistory = { searchHistory : searchHistory };
    
        localStorage.setItem("searchHistory", JSON.stringify(jsonHistory));
    
        renderSearchHistory();   
    }
}

function renderSearchHistory() {
    searchHistoryListDiv.empty();

    var searchHistory = [];

    if (localStorage.getItem("searchHistory"))
        searchHistory = JSON.parse(localStorage.getItem("searchHistory")).searchHistory;

    for (let i = 0; i < searchHistory.length; i++) {
        var liDiv = $("<li class=\"list-group-item list-group-item-action\" data-value=\"" + searchHistory[i] + "\">" + searchHistory[i] + "</li>");
        
        liDiv.click(function(event) {
            $("#cityInput").val(event.currentTarget.dataset.value);
            searchCityWeather();
        });
        
        searchHistoryListDiv.append(liDiv);
    }

}