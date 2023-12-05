# Project Setup

## Database Configuration

### 1. Create PostgreSQL Database

Ensure you have PostgreSQL installed, then run the following command to create a PostgreSQL database for your project. Replace 'express' with your desired database name.

```bash
createdb express
```

### 2. Run Sequelize Migrations

Execute the following commands to set up the database tables using Sequelize migrations.

```bash
npx sequelize-cli db:migrate
```

### 3. Undo Migrations (Optional)

To undo all migrations (useful for development or testing), run the following command.

```bash
npx sequelize-cli db:migrate:undo:all
```

### 4. Generate Migration for 'bikeOwner' Table

Create a migration for the 'bikeOwner' table using the following command.

```bash
npx sequelize-cli migration:generate --name create-bikeOwner
```

### 5. Run Seeders (Optional)

Populate the database with sample data using seeders.

```bash
npx sequelize-cli db:seed:all
```

## Environment Variables

Create a `.env` file in the root of your project and add the following environment variables:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASS=1234
DB_NAME=express
DB_DIALECT=postgres
DB_PORT=5432
APP_HOST=localhost
APP_PORT=3000
SECRET=AD4998DF466B61F5073DAB115BB8B245
IS_GOOGLE_AUTH_ENABLE=false
FIREBASE_ADMIN_CREDENTIALS=parkingauto-78411-firebase-adminsdk-4pury-d89eb2bbd9.json
```

For the `SECRET` variable, you can generate a secure random string using PowerShell:

```powershell
# Generate a random hex string
$randomBytes = New-Object byte[] 16
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($randomBytes)
$randomHex = -join ($randomBytes | ForEach-Object { $_.ToString("X2") })
Write-Output $randomHex
```

For FIREBASE_ADMIN_CREDENTIALS

```javascript

{
  "type": "service_account",
  "project_id": "parkingauto-78411",
  "private_key_id": "d89eb2bbd9f6c78afcc9b1240ddd535eac56e8af",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCfJH6Ci3hwDrAf\nHrajwwUXDnz0khIOWIuMft2YCwLYCRWcG/2scdsEG370/Vqz5x7bYpYht9d3oXNv\nMny7mGHRAUHCM1bQwhSx4GTsUL5jFkOHceenAp/bAMnXwExFjNJhTZHaaxawTy9T\nSHbJy6Qdoj9xbfM+aBxcx3mGW/VijSBBr2Goh95RfLA9xrBr4C7kzwwLTVsjXesj\nOmjTx1QLTdomkCpFe7N4blzTKf9gtpBZ0WrECd3vdt5FYwE9cATK6y+khETPJy/A\nD/Z3sW2mD4cz+kpOf3Im7S96u2JWp/KGzrgfC9ythv1VqTgfzifdY00iRa3pyWiw\n1N8qMLXzAgMBAAECggEABjBAnSn4Rn9DuQoUNx0L0yA0mrwdaKJn1tBOJK3079q2\nlOn/vNd2mVvKXZOGle1cZVKZnPkNr3C/UOkpMZBU6XA/kuI1M4wAiwQ7WHcxWCAT\nAy7aP8PZ3IXU04d+T8wQmEkQbWpxqOyDXh04xVMecCqRhgMtDNW2mKMHJkLoMWtU\nweoDQVw2zM2EKMeZtMayjnUst8M6K4hFh+dHnL2c9z8vHr7HJ/tm8Gnj3FgxgtHz\njLij/HQPhA4RAMUAGQZ8Q+rEDCVf+4bPq3/GvyNjE31OpgM5sR+75yPWpz7YQnqX\nu3tlIHTHPb6qRO11mwA3LTjz5ZC8YWUkrZorgNF3RQKBgQDZzwtj6n2MwD/I8OdW\nuv4a5+FMGIfLHf2wV2ocp4HV3uIVmysUhQa1OweJ7hYm68zHhBgk7ikpJN8iNkhl\nHgiisCgVm74840Tqh10XbAJQk87cxevulqqymNjgNW+5Bn9H7JuEO94Arslqz5Vp\n4Rl8xOtFItxqbK8HVd3usIpX/QKBgQC7DA1/icIttF0z0Hzb/RXG7SJ4FO5Aibnt\nITdb5DmrSkpH12V/JjVQoN2UcNmZK8napcoT2f3XFXiJ5mu80STa9Qof0a8Qns7p\n7itWfaHu026bu12xuDCokHdGX1AHziO5HCvO/8RdoAY/Vz5+fZsvpbC5V7HLfIxV\nuoJOC/XQrwKBgBHzLzQfyhMEcP1FZTtPk8tx2q5jwyUpJpQW0CbmYxvWD3nKXOWH\nBQOAhuGGHos8mZbDux2oBvpeEImIQbUboYiOze7h8+6eqDpPx4s7moE7fSvSn9v8\nzLqFQDJSFRABihHKXRKrwGL8BJtp2h1ssKYIsH71HYcjx9Tp7a1THUOdAoGAMOGy\neV0gAN+857iZmMgoM8dvFaCqrvUPQNhIZlxbcddFWEcDQFpU3pBbt9pSE4RtCRYA\nnHWAr//tc2RjTYH+trYJAk3DCX3nJx1V+BF3Czn4EvzBPJudI8A1W4+3E4MctNiW\n3k7bG3ihiVYcf+QFdUtAxv8S+NHAvvqx6QGZKQMCgYAQMz3f/BUHbZ35AHnip9ma\nUf1P9pwQsRSh8EMeADadQqBwUibBuIcoOLHrIqRYZDFMi7GOnY7SfVv0uYfOvQwv\nJTbOzVR0avax73xCmRS1PS4R9/1n8cHAjVfWFVVt0/+5dIC5dG/TKKdWdRa7U0WB\np9lfDNVizy11BLs8BE6EHQ==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-4pury@parkingauto-78411.iam.gserviceaccount.com",
  "client_id": "111005366232095384599",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-4pury%40parkingauto-78411.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

```

## Run the Application

Install dependencies and start the application.

```bash
yarn install && yarn start
```

The application will be accessible at `http://localhost:3000`.
