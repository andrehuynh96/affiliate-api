# Create a self-signed cert

```sh
openssl genrsa 4096 > private.pem
openssl req -x509 -new -key private.pem -out public.pem
openssl pkcs12 -export -in public.pem -inkey private.pem -out affiliate-cert-dev.pfx
```

FOR WINDOWS
```sh
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```