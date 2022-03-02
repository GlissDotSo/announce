import { makeObservable, observable, computed, action, flow } from "mobx"

export class AppStore {
    // Selected profile.
    profile: any = null

    constructor() {
        makeObservable(this, {
            profile: observable,
            setProfile: action
        })
    }

    setProfile(profile: any) {
        this.profile = profile
    }
}

let store = new AppStore()
export { 
    store
}