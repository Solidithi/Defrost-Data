# defrost-db

A database client package for Defrost protocol that provides access to the
database schema and models.

## Installation

```bash
npm install defrost-db
# or
yarn add defrost-db
# or
pnpm add defrost-db
```

## Usage

```typescript
import { getPrismaClient } from "defrost-db";

// Connect to the database
const prisma = getPrismaClient(
	"postgresql://username:password@localhost:5432/defrost"
);

// Example: Query all projects
async function getAllProjects() {
	const projects = await prisma.project.findMany();
	return projects;
}

// Example: Get pools for a project
async function getPoolsForProject(projectId: string) {
	const pools = await prisma.pool.findMany({
		where: {
			project_id: projectId,
		},
		include: {
			project: true,
		},
	});
	return pools;
}

// Example: Get user stakes
async function getUserStakes(userAddress: string) {
	const stakes = await prisma.stake.findMany({
		where: {
			user_address: userAddress,
		},
		include: {
			pool: true,
		},
	});
	return stakes;
}

// Always close the connection when done
async function cleanup() {
	await prisma.$disconnect();
}
```

## Database Schema

The package includes the Prisma schema for the Defrost protocol database. The
main entities include:

- `user`: User information and statistics
- `project`: Project details
- `pool`: Staking pools with their configurations
- `stake`: User staking records
- `unstake`: User unstaking records
- `interest_claim`: Interest claim records
- `platform_statistics`: Overall platform statistics
- `emission_rate`: Emission rate records for pools
- `native_exchange_rate_snapshot`: Native token exchange rate snapshots
- `project_exchange_rate_snapshot`: Project token exchange rate snapshots

## Environment Variables

When using this package, you can either:

1. Pass the database URL directly to the `getPrismaClient` function
2. Set the `DB_URL` environment variable

## License

MIT
