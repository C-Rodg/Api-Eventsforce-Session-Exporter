app.controller('EventsforceCtrl', function($base64, $scope, eventsforceService){

	var QueryString = function () {
	  var query_string = {};
	  var query = window.location.search.substring(1);
	  //return no paramters
	  if(query === ''){
	  	return false;
	  }
	  var vars = query.split("&");
	  for (var i=0;i<vars.length;i++) {
	    var pair = vars[i].split("=");
	        // If first entry with this name
	    if (typeof query_string[pair[0]] === "undefined") {
	      query_string[pair[0]] = decodeURIComponent(pair[1]);
	        // If second entry with this name
	    } else if (typeof query_string[pair[0]] === "string") {
	      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
	      query_string[pair[0]] = arr;
	        // If third or later entry with this name
	    } else {
	      query_string[pair[0]].push(decodeURIComponent(pair[1]));
	    }
	  } 
	    return query_string;
	}();

	//Helper function to re-render inputs
	$scope.renderInputs = function() {
		setTimeout(function(){componentHandler.upgradeDom()});
	}	

	function Session(key, topic, category, start, end, location){
		return {
			"Key": key,
			"Topic": topic,
			"Printed": "",
			"Category" : category,
			"StartDate": parseDate(start, 'M/D/YYYY'),
			"StartTime" : parseDate(start, 'HH:mm'),
			"EndDate" : parseDate(end, 'M/D/YYYY'),
			"EndTime" : parseDate(end, 'HH:mm'),
			"Description" : "",
			"Location" : location,
			"Tags" : key
		}
	}

	function parseDate(wholeDate, format) {
		var date = moment(wholeDate);
		var timezone = $scope.timezone;
		date.utc();
		timezone = Number(timezone);
		if(timezone > 0){
			date.add(timezone, 'hours');
		} else if (timezone < 0) {
			date.subtract(Math.abs(timezone), 'hours');
		}
		return date.format(format);		
	}
	
	//Export Csv from table data
	$scope.exportCsv = function(){
		if ($scope.eventsforce.tableData.length  <= 0){
			return false;
		}
		return $scope.eventsforce.tableData;
	};

	//Get sessions
	$scope.findSessions = function(){
		$scope.eventsforce.tableData = [];
		$scope.eventsforce.results = {};		
		//Encode key as base64 with ':' prefix
		$scope.eventsforce.credentials64 = $base64.encode(':' + $scope.eventsforce.apiPassword);
		
		//Get Sessions
		var getSessions = eventsforceService.requestSessions($scope.eventsforce.url, $scope.eventsforce.eventId, $scope.eventsforce.credentials64);	
		$scope.eventsforce.error = false;
		//Resolve getSessions
		getSessions.then(function(obj){
			if(obj.statusText === 'OK' && obj.data.responseCode === 200){
				$scope.eventsforce.results = obj.data;
				$scope.eventsforce.sessionNumbers = $scope.eventsforce.results.itemCount;
				$scope.eventsforce.success = true;
				$scope.parseResults($scope.eventsforce.results.data);
			} else {
				console.log("ERROR");
				$scope.eventsforce.error = true;			
			}
		},
			function(err){
				console.log("ERROR");
				console.log(err);
				$scope.eventsforce.error = true;			
			}
		);
	};

	$scope.parseResults = function(result){
		console.log(result);
		for(var i = 0, j = result.length; i < j; i++){
			$scope.eventsforce.tableData.push(Session(result[i].sessionID, result[i].sessionName, result[i].sessionType, result[i].sessionStartDateTime, result[i].sessionEndDateTime, result[i].locationName));
		}
	};

	$scope.eventsforce = {};
	$scope.eventsforce.url = 'https://www.eventsforce.net/devcon/api/v2/events/';
	$scope.eventsforce.eventId = '';
	$scope.eventsforce.apiPassword = '';
	$scope.eventsforce.credentials64 = '';
	
	$scope.eventsforce.results = {};
	$scope.eventsforce.tableData = [];
	$scope.eventsforce.success = false;
	$scope.eventsforce.error = false;
	$scope.eventsforce.sessionNumbers = 0;
	$scope.timezone = '';
	
	$scope.csvOrder = ["Key", "Topic", "Printed", "Category", "StartDate", "StartTime", "EndDate", "EndTime", "Description", "Location", "Tags", "TrackAttendance", "Capacity"];

	//Import url paramaters if they exist
	if(QueryString){
		if(QueryString.e){
			$scope.eventsforce.eventId = QueryString.e;
		}
		if(QueryString.p){
			$scope.eventsforce.apiPassword = QueryString.p;
		}		
		if(QueryString.t){
			$scope.timezone = QueryString.t;
		}
	}

	$scope.renderInputs();

});

//Entire card element
app.directive('eventforceCard', function() {
	return {
		restrict: 'E',
		templateUrl: './js/templates/eventforceCard.html'
	}
});

//Passbook Settings Element
app.directive('eventforceSettings', function() {
	return {
		restrict: 'E',
		templateUrl: './js/templates/eventforceSettings.html',
		link: function($scope){
			$scope.renderInputs();
		}
	}
});