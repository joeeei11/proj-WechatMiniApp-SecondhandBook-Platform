// pages/admin/index/index.js - 管理后台首页
const app = getApp()

Page({
    data: {
        stats: { totalUsers: 0, totalBooks: 0, totalOrders: 0, activeBooks: 0 }
    },

    onShow() {
        if (!app.globalData.isAdmin) {
            wx.showToast({ title: '无权限', icon: 'error' })
            setTimeout(() => wx.navigateBack(), 1500)
            return
        }
        this.loadStats()
    },

    async loadStats() {
        const db = wx.cloud.database()
        try {
            const [users, books, orders, activeBooks] = await Promise.all([
                db.collection('users').count(),
                db.collection('books').count(),
                db.collection('orders').count(),
                db.collection('books').where({ status: 'on_sale' }).count()
            ])
            this.setData({
                stats: {
                    totalUsers: users.total,
                    totalBooks: books.total,
                    totalOrders: orders.total,
                    activeBooks: activeBooks.total
                }
            })
        } catch (err) {
            console.error('统计失败:', err)
        }
    },

    goBooks() { wx.navigateTo({ url: '/pages/admin/books/books' }) },
    goUsers() { wx.navigateTo({ url: '/pages/admin/users/users' }) },
    goStats() { wx.navigateTo({ url: '/pages/admin/stats/stats' }) }
})
