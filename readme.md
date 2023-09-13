# Express Demo for rate-limit-postgresql

Simple Express APP set up using [express-generator](https://expressjs.com/en/starter/generator.html) as an example for using [rate-limit-postgresql](https://www.npmjs.com/package/@acpr/rate-limit-postgresql)


#### Steps for running the demo project

1. Generate an environment file. Easiest option would be to run `cp .env.example .env`

2. Run `docker compose up -d`

3. Access `http://localhost:3005/users` for testing `PostgresStore` (aggregated store, used by default). You will be able to see the state of the rate limiting table by running 

```sh
docker compose exec db psql --user user database -c "select * from rate_limit.aggregated_records;"
```


4. Access `http://localhost:3005/other-users` for testing `PostgresStoreIndividualIP`. You will be able to see the state of the rate limiting table by running 

```sh
docker compose exec db psql --user user database -c "select * from rate_limit.individual_records;"
```