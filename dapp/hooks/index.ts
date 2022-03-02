
import { deployments } from '../config'

export const useDeployments = () => {
    // TODO: switch network.
    const ctx = {
        deployments: deployments.localhost
    }
    return [ctx]
}