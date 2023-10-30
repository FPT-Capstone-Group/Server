module.exports =  ({ env }) => ({
	connection: {
		client: 'postgres',
		connection: {
		host: env('DATABASE_HOST', 'smart-parking.postgres.database.azure.com'),
			port: env.int('DATABASE_PORT', 5432),
			database: env('DATABASE_NAME', 'Smart_Parking'),
			user: env('DATABASE_USERNAME', 'smart_parking_pg_admin'),
			password: env('DATABASE_PASSWORD', 'p@$$w0rd'),
			ssl: env.bool('DATABASE_SSL', false)
		}
	}
});
