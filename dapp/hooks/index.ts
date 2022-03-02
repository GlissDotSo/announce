
import { deployments, lensAddresses } from '../config'

export const useDeployments = () => {
    // TODO: switch network.
    
    const ctx = {
        deployments: deployments.localhost,
        lensAddresses: lensAddresses.localhost
    }
    return [ctx]
}