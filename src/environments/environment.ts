// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  rpcURL: 'http://miner.northeurope.cloudapp.azure.com:8080',
  contractAddres: '0x93303e4d223c2f7efa73241d082cdf81cd82a8b2'
};
