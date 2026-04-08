## Backend Functionality

1. Import the necessary libs: express, cors, dotenv  

2. Set functionality for `prisma` to be able to communicate with the actual database.  

3. Build the structure of the backend:  
```
backend/
    node_modules/
    prisma/
        schema.prisma
    src/
        config/
            constants.ts
            database.ts  // testing connection to database
        lib/
            client.ts
        server.ts
    .env
    package.json
    prisma.config.ts
    tsconfig.ts
```  

4. Pull the actual database into the schema.prisma and generate a client to start communicate with the database:  
```
npx prisma db pull
npx prisma generate
```
  
5. Until now we have these files: 
```
prisma.config.ts        ← tells Prisma HOW to connect (credentials)
schema.prisma           ← defines WHAT your database looks like
src/lib/prisma.ts       ← the actual client you import everywhere
```

