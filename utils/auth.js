// utils/auth.js - 登录状态管理
const { userAPI } = require('./api')

/**
 * 检查是否已登录
 */
const isLoggedIn = () => {
    const app = getApp()
    return !!(app.globalData.openid && app.globalData.userInfo)
}

/**
 * 检查登录状态，未登录则跳转登录页
 * @returns {boolean} 是否已登录
 */
const checkLogin = () => {
    if (!isLoggedIn()) {
        wx.navigateTo({ url: '/pages/login/login' })
        return false
    }
    return true
}

/**
 * 需要登录的页面装饰器
 * 在 Page 的 onLoad 中调用
 */
const requireLogin = (callback) => {
    if (checkLogin()) {
        callback && callback()
    }
}

/**
 * 刷新用户信息
 */
const refreshUserInfo = async () => {
    const app = getApp()
    if (!app.globalData.openid) return null
    try {
        const userInfo = await userAPI.getUserInfo(app.globalData.openid)
        app.globalData.userInfo = userInfo
        app.globalData.isAdmin = userInfo.isAdmin || false
        wx.setStorageSync('userInfo', userInfo)
        return userInfo
    } catch (e) {
        console.error('刷新用户信息失败:', e)
        return null
    }
}

module.exports = {
    isLoggedIn,
    checkLogin,
    requireLogin,
    refreshUserInfo
}
