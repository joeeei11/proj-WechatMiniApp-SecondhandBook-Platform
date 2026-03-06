// pages/admin/books/books.js - 书籍审核管理
Page({
    data: {
        books: [],
        loading: true,
        filterStatus: '' // 'on_sale', 'withdrawn', ''
    },

    onShow() {
        this.loadBooks()
    },

    async loadBooks() {
        this.setData({ loading: true })
        const db = wx.cloud.database()
        try {
            let query = db.collection('books')
            if (this.data.filterStatus) {
                query = query.where({ status: this.data.filterStatus })
            }
            const res = await query.orderBy('createTime', 'desc').limit(50).get()
            this.setData({ books: res.data, loading: false })
        } catch (err) {
            console.error('加载失败:', err)
            this.setData({ loading: false })
        }
    },

    filterChange(e) {
        this.setData({ filterStatus: e.currentTarget.dataset.status })
        this.loadBooks()
    },

    async withdrawBook(e) {
        const id = e.currentTarget.dataset.id
        const res = await wx.showModal({ title: '管理员操作', content: '确认下架此书籍？', confirmColor: '#F56C6C' })
        if (!res.confirm) return
        const db = wx.cloud.database()
        await db.collection('books').doc(id).update({ data: { status: 'withdrawn' } })
        wx.showToast({ title: '已下架' })
        this.loadBooks()
    },

    async restoreBook(e) {
        const id = e.currentTarget.dataset.id
        const db = wx.cloud.database()
        await db.collection('books').doc(id).update({ data: { status: 'on_sale' } })
        wx.showToast({ title: '已恢复上架' })
        this.loadBooks()
    },

    goDetail(e) {
        wx.navigateTo({ url: `/pages/book-detail/book-detail?id=${e.currentTarget.dataset.id}` })
    }
})
