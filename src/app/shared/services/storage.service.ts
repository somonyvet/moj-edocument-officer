export async function setShowInfo(val: boolean) {
  return await localStorage.setItem('camwin_show_info', `${val}`)
}

export async function removeShowInfo() {
  return await localStorage.removeItem("camwin_show_info")
}

export async function getShowInfo() {
  const doc = await localStorage.getItem("camwin_show_info");
  return doc && doc==='true' ? true : false;
}


export async function setIsLoggedIn(val: boolean) {
  return await localStorage.setItem('camwin_isLoggedIn', `${val}`)
}

export async function removeIsLoggedIn() {
  return await localStorage.removeItem("camwin_isLoggedIn")
}

export async function getIsLoggedIn() {
  const doc = await localStorage.getItem("camwin_isLoggedIn");
  return doc;
}


export async function setToken(val: any) {
  return await localStorage.setItem('camwin_token', `${val}`)
}

export async function removeToken() {
  return await localStorage.removeItem("camwin_token")
}

export async function getToken() {
  return await localStorage.getItem("camwin_token")
}

export async function setUser(val: any) {
  return await localStorage.setItem('camwin_user', JSON.stringify(val))
}

export async function removeUser() {
  return await localStorage.removeItem("camwin_user")
}

export async function getUser() {
  const doc = await localStorage.getItem("camwin_user");
  return JSON.parse(doc)
}


export async function setProfile(val: any) {
  // return await localStorage.setItem('camwin_profile', JSON.stringify(val))
}

export async function removeProfile() {
  return await localStorage.removeItem("camwin_profile")
}

export async function getProfile() {
  const doc = await localStorage.getItem("camwin_profile");
  return JSON.parse(doc)
}



export async function setRememberMe(val: any) {
  return await localStorage.setItem('camwin_remember', `${val}`)
}

export async function removeRememberMe() {
  return await localStorage.removeItem("camwin_remember")
}

export async function getRememberMe() {
  const doc = await localStorage.getItem("camwin_remember");
  return doc
}
