#!/bin/bash

# Build the TypeScript code
echo "Building package..."
pnpm run build

# Generate Prisma client
echo "Generating Prisma client..."
pnpm prisma generate

# Pack the package to verify its contents
echo "Creating package tarball for verification..."
pnpm pack

echo "Package preparation complete!"
echo "You can now publish with: pnpm publish"