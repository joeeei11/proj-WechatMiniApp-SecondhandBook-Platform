// pages/admin/users/users.js - 用户管理
Page({
    data: { users: [], loading: true },

    onShow() { this.loadUsers() },

    async loadUsers() {
        this.setData({ loading: true })
        const db = wx.cloud.database()
        try {
            const res = await db.collection('users').orderBy('createTime', 'desc').limit(50).get()
            this.setData({ users: res.data, loading: false })
        } catch (err) {
            console.error('加载用户失败:', err)
            this.setData({ loading: false })
        }
    },

    async toggleBan(e) {
        const { id, banned } = e.currentTarget.dataset
        const action = banned ? '解封' : '封禁'
        const res = await wx.showModal({ title: `确认${action}`, content: `确定要${action}此用户吗？`, confirmColor: banned ? '#4A90E2' : '#F56C6C' })
        if (!res.confirm) return
        const db = wx.cloud.database()
        await db.collection('users').doc(id).update({ data: { isBanned: !banned } })
        wx.showToast({ title: `已${action}` })
        this.loadUsers()
    },

    viewProfile(e) {
        wx.navigateTo({ url: `/pages/profile/profile?userId=${e.currentTarget.dataset.id}` })
    }
})
