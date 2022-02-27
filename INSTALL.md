# Install.


```
git submodule init
git submodule update


cd lens-protocol/
npm i
# generate typescript bindings and compile contracts
npm run compile
# deploy
npm run full-deploy-local
# setup mock data on Lens
npx hardhat setup-mock-env --network localhost


cd subgraph/
npm i
docker-compose up

# deploy subgraph
cp .env.local .env
npm run create-local
NETWORK=localhost npm run codegen && ./deploy.sh


cd dapp/
npm i
npm run dev
```