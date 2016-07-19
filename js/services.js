app.service('eventsforceService', function($http){
	
	this.requestSessions = function(url, eventId, password){
		//Ensure form has fields
		if (url === '' || eventId === '' || password === ''){
			return false;
		}

		//Build query string
		var midUrl = url.replace(/^((http|https):\/\/)?(www\.)?/, '');
		var aspAction = 'js/actions/GetSessions.asp?'
		aspAction += 'url=' + midUrl;
		aspAction += '&eventId=' + eventId;
		aspAction += '&password=' + password;

		//Return promise object
		return $http.get(aspAction);		
	};

});