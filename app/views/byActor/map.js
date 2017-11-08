function(doc) {
   if(doc.type === 'actor') {
	   emit(doc.actor, doc.movies);
   }
};