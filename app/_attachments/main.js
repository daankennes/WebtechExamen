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
	
	.controller('homeCtrl', function($scope, getMoviesSrv, checkMoviesSrv) {
		
	    	$('#searchButton').on('click', function (e) {


	    		var actor = $('#actorText').val();
	    		
	    		var datafound = false;
	    		
	    		//check if actor exists in couchDB. If true, bind movies to $scope.movies
	    		checkMoviesSrv.checkMoviesInDB().then(function(data){
	    			console.log(data);
	    			for (var i = 0; i < data.data.rows.length; i++){
	    				if (data.data.rows[i].key === actor){
	    					console.log(data.data.rows[i].value);
	    					$scope.movies = data.data.rows[i].value;
	    					datafound = true;
	    				}
	    			}
	    		});
	    		
	    		console.log($scope.movies);
	    		
	    		//if datafound is still false, use getMoviesSrv service
	    		if (!datafound){
	    			
	    			console.log("Data not found in DB");
	    			
		    		getMoviesSrv.getMovies(actor).then(function(data){
		    			
		    			console.log(data);
		    			//display data
		    			$scope.displaymovies = data.movies;
		    			console.log($scope.displaymovies);
		    			
		    		});
	    		}
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
		  /*this.setObject = function(key, value){
			  $window.localStorage[key] = JSON.stringify(value);
			  //Save in CouchDB
			  //$http.put('../../' + key, value);
		  };*/
    	
    	
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
		  
	});