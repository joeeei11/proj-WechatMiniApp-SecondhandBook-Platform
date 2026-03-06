// pages/login/login.js
const { userAPI } = require('../../utils/api')
const { COLLEGES, GRADES } = require('../../utils/format')

Page({
    data: {
        mode: 'login', // 'login' 或 'edit'
        form: { avatarUrl: '', nickName: '', college: '', grade: '', phone: '' },
        colleges: COLLEGES,
        grades: GRADES,
        saving: false
    },

    async onLoad(options) {
        this.setData({ mode: options.mode || 'login' })
        if (options.mode === 'edit') {
            wx.setNavigationBarTitle({ title: '编辑资料' })
            const app = getApp()
            if (app.globalData.userInfo) {
                const u = app.globalData.userInfo
                this.setData({ form: { avatarUrl: u.avatarUrl || '', nickName: u.nickName || '', college: u.college || '', grade: u.grade || '', phone: u.phone || '' } })
            }
        } else {
            // 尝试自动登录
            wx.showLoading({ title: '登录中...' })
            const app = getApp()
            try {
                const res = await app.login()
                if (!res.isNewUser && res.userInfo && res.userInfo.nickName) {
                    // 老用户且资料完整，直接跳首页
                    wx.switchTab({ url: '/pages/index/index' })
                }
            } catch (e) { }
            wx.hideLoading()
        }
    },

    onInput(e) { this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value }) },
    selectCollege(e) { this.setData({ 'form.college': COLLEGES[e.detail.value] }) },
    selectGrade(e) { this.setData({ 'form.grade': GRADES[e.detail.value] }) },

    async chooseAvatar() {
        try {
            const res = await wx.chooseMedia({ count: 1, mediaType: ['image'], sizeType: ['compressed'], sourceType: ['album', 'camera'] })
            this.setData({ 'form.avatarUrl': res.tempFiles[0].tempFilePath })
        } catch (e) { }
    },

    async saveProfile() {
        if (!this.data.form.nickName.trim()) { wx.showToast({ title: '请输入昵称', icon: 'none' }); return }
        this.setData({ saving: true })
        wx.showLoading({ title: '保存中...' })
        try {
            // 上传头像（如果是本地路径）
            let avatarUrl = this.data.form.avatarUrl
            if (avatarUrl && !avatarUrl.startsWith('cloud://') && !avatarUrl.startsWith('https://')) {
                const cloudPath = `avatars/${Date.now()}.jpg`
                const res = await wx.cloud.uploadFile({ cloudPath, filePath: avatarUrl })
                avatarUrl = res.fileID
            }
            await userAPI.updateUserInfo({ ...this.data.form, avatarUrl })
            wx.showToast({ title: '保存成功！' })
            setTimeout(() => {
                if (this.data.mode === 'edit') wx.navigateBack()
                else wx.switchTab({ url: '/pages/index/index' })
            }, 1200)
        } catch (e) {
            wx.showToast({ title: '保存失败', icon: 'error' })
        } finally {
            wx.hideLoading()
            this.setData({ saving: false })
        }
    }
})
