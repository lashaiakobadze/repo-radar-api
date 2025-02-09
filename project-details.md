### Key sections in the README:

1. **API Endpoint**: Describes the `/search/repositories` endpoint, query parameters, and response format.
2. **Docker Configuration**: Provides the `docker-compose.yml` setup for Elasticsearch, Logstash, Kibana, and the app.
3. **Dockerfile**: Shows the `Dockerfile` for building the API container.
4. **Testing**: Explains how to run end-to-end tests with `jest`.
5. **How to Run**: Gives the steps to clone the repo, build, and run the application with Docker Compose.
6. **Http API** started on port: ${HTTP_PORT}
7. **Http API docs** are available at: ${url}/docs
8. e2e test are at test folder: github-search.e2e-spec.ts

# RepoRadar API

RepoRadar API is a service that allows you to search for GitHub repositories based on a search query. It provides an endpoint for querying repositories, supporting optional sorting and ignoring certain repository names.

## Features

- **Search GitHub Repositories**: Accepts a search string and fetches repositories from GitHub matching the query.
- **Sort**: Sort results by repository name in ascending or descending order.
- **Ignore**: Exclude repositories whose names contain a specific string.
- **Results**: Returns a list of repositories matching the criteria.

## API Endpoint

### `GET /search/repositories`

#### Query Parameters

- **query** (required): The search string to query GitHub repositories.
- **order** (optional): Sort the results by repository name. Possible values: `asc` (ascending), `desc` (descending).
- **ignore** (optional): Exclude repositories whose names contain this string.
- **page** (optional): The page number to fetch results from (defaults to `1`).
- **per_page** (optional): The number of repositories to fetch per page (defaults to `30`).
