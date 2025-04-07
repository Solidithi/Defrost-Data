# Defrost Data Mono Repo

This is a mono repository containing the indexer and database components for the
Defrost project.

## Repository Structure

- `/indexer`: Contains the Subsquid indexer for blockchain data
- `/database`: Contains database access layer and models

## Getting Started

### Prerequisites

- Node.js v16+
- pnpm
- PostgreSQL database

### Installation

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build
```

### Running the services

```bash
# Run the indexer
pnpm start:indexer

# Run the database service
pnpm start:database
```

## Development

Each package can be developed independently or as part of the mono repo.

### Linting and Formatting

The project uses ESLint and Prettier for code quality and formatting. It's set
up with lint-staged to automatically lint and format code on commit.

```bash
# Run linting
pnpm lint

# Format code
pnpm format
```

## Environment Variables

Create `.env` files in the respective directories with the following variables:

### Indexer `.env`

```
RPC_ENDPOINT=your_rpc_endpoint
```

### Database `.env`

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yoursecretpassword
DB_NAME=defrost
```
