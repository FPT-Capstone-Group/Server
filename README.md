create postgres db
migrate db 

```
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli migration:generate --name create-bikeOwner

```
env

```
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

```
SECRET can use  powershell
```
Generate powershell secret 
$randomBytes = New-Object byte[] 16
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($randomBytes)
$randomHex = -join ($randomBytes | ForEach-Object { $_.ToString("X2") })
Write-Output $randomHex

```

yarn install && yarn start
