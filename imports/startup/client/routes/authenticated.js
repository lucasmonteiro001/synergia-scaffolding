import "../../../ui/authenticated/users/users";

authenticatedRoutes.route( '/users', {
	name: 'users',
	action() {
		BlazeLayout.render( 'default', { yield: 'users' } );
	} 
});