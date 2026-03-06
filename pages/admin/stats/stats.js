// pages/admin/stats/stats.js - 数据统计页面
Page({
    data: {
        stats: {},
        topBooks: [],
        recentOrders: [],
        loading: true
    },

    onShow() { this.loadStats() },

    async loadStats() {
        this.setData({ loading: true })
        const db = wx.cloud.database()
        const _ = db.command
        try {
            // 基础统计
            const [usersRes, booksRes, ordersRes, completedRes] = await Promise.all([
                db.collection('users').count(),
                db.collection('books').count(),
                db.collection('orders').count(),
                db.collection('orders').where({ status: 'completed' }).count()
            ])

            // 热门书籍（按浏览量排序）
            const topBooksRes = await db.collection('books')
                .where({ status: 'on_sale' })
                .orderBy('viewCount', 'desc')
                .limit(10)
                .get()

            // 最近订单
            const recentOrdersRes = await db.collection('orders')
                .orderBy('createTime', 'desc')
                .limit(10)
                .get()

            this.setData({
                stats: {
                    totalUsers: usersRes.total,
                    totalBooks: booksRes.total,
                    totalOrders: ordersRes.total,
                    completedOrders: completedRes.total,
                    completionRate: ordersRes.total > 0 ? Math.round(completedRes.total / ordersRes.total * 100) : 0
                },
                topBooks: topBooksRes.data,
                recentOrders: recentOrdersRes.data,
                loading: false
            })
        } catch (err) {
            console.error('统计失败:', err)
            this.setData({ loading: false })
        }
    }
})
