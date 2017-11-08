'use strict'

angular.module('actorApp', ['ngRoute'])

	.config(function($routeProvider) {
	    $routeProvider
	        .when('/home', {
	            templateUrl: 'assets/views/home.html',
	            controller: 'homeCtrl'
	        })
	        .otherwise({
	        	redirectTo: '/home'
	        });
	})
	
	.controller('homeCtrl', function($scope, getMoviesSrv, checkMoviesSrv, saveMovieSrv) {
		
	    	$('#searchButton').on('click', function (e) {


	    		var actor = $('#actorText').val();
	    		
	    		var notfound = true;
	    		
	    		//check if actor exists in couchDB. If true, bind movies to $scope.movies
	    		checkMoviesSrv.checkMoviesInDB().then(function(data){
	    			
	    			for (var i = 0; i < data.data.total_rows; i++){
	    				if (data.data.rows[i].key.toLowerCase() === actor.toLowerCase()){
	    					
	    					console.log(data.data.rows[i].value);
	    					$scope.displaymovies = data.data.rows[i].value;
	    					notfound = false;
	    					console.log("Found in CouchDB");
	    				}
	    			}
	    		}).then(function(){
	    			
		    		//if notfound is still true, use getMoviesSrv service
		    		if (notfound){
		    			
		    			console.log("Data not found in DB");
		    			
			    		getMoviesSrv.getMovies(actor).then(function(data){
			    			
			    			console.log(data);
			    			//display data
			    			$scope.displaymovies = data.movies;
			    			
			    			//save data to CouchDB
			    			saveMovieSrv.saveMovieToDB(data);
			    		});
		    		}		
	    		})   		
	    	});
    })
   
    .service('getMoviesSrv', function($http, $q) {
    		this.getMovies = function(actor) {
	    		var q = $q.defer();
	    		var url = 'http://theimdbapi.org/api/find/person?name=' + encodeURIComponent(actor);
	    		//http://theimdbapi.org/api/find/person?name=steve+mcqueen

	    		$http.get(url)
	    			.then(function(data){
	    				
	    				//only actor and movies needed
	    				var finaldata = {"actor": data.data[0].title, "movies": []};
	    				
	    				for (var i = 0; i < data.data[0].filmography.actor.length; i++){
	    					finaldata.movies.push(data.data[0].filmography.actor[i].title);
	    				}
	    				
	    				q.resolve(finaldata);
	    			}, function error(err) {
	    				q.reject(err);
	    			});
	    			
	    			return q.promise;
	    		};
    })
    
 
    .service('checkMoviesSrv', function($window, $http, $q){
    	
    	this.checkMoviesInDB = function(data){
    		
    		var q = $q.defer();
    		var url = 'http://127.0.0.1:5984/examen/_design/app/_view/byActor';
    		
    		$http.get(url)
    		.then(function(data){
    			q.resolve(data);
    		}, function error(err) {
    			q.reject(err);
    		});
    			
    		return q.promise;
    		
    	};
		  
	})

	.service('saveMovieSrv', function($window, $http, $q){
		
		this.saveMovieToDB = function(data){
			
			var q = $q.defer();
			var url = 'http://127.0.0.1:5984/examen/';
			
			data.type = "actor";
			console.log(data);
			
			$http.put(url + data.actor.toLowerCase().trim(), JSON.stringify(data))
	  		 .success(function (data, status, headers) {
	               console.log("Actor + movies saved in CouchDB");
	           })
	           .error(function (data, status, header, config) {
	               console.log(data);
	           })
				 .then(function(data){
					 q.resolve(data);
				 }, function error(err) {
					 q.reject(err);
				 });
			
			return q.promise;
			
		};
		  
	})