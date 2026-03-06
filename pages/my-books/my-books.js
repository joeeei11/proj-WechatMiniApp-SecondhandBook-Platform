// pages/my-books/my-books.js - 我的发布
const { bookAPI } = require('../../utils/api')
const { formatTime, formatBookStatus, CONDITION_MAP } = require('../../utils/format')

Page({
    data: {
        books: [],
        loading: true,
        conditionMap: CONDITION_MAP
    },

    onShow() {
        this.loadMyBooks()
    },

    async loadMyBooks() {
        this.setData({ loading: true })
        try {
            const books = await bookAPI.getMyBooks()
            const enriched = books.map(b => ({
                ...b,
                statusInfo: formatBookStatus(b.status),
                createTimeStr: formatTime(b.createTime)
            }))
            this.setData({ books: enriched, loading: false })
        } catch (err) {
            console.error('加载失败:', err)
            this.setData({ loading: false })
            wx.showToast({ title: '加载失败', icon: 'error' })
        }
    },

    goPublish() {
        wx.switchTab({ url: '/pages/publish/publish' })
    },

    goDetail(e) {
        wx.navigateTo({ url: `/pages/book-detail/book-detail?id=${e.currentTarget.dataset.id}` })
    },

    goEdit(e) {
        wx.navigateTo({ url: `/pages/edit-book/edit-book?id=${e.currentTarget.dataset.id}` })
    },

    async withdrawBook(e) {
        const id = e.currentTarget.dataset.id
        const res = await wx.showModal({
            title: '确认下架',
            content: '下架后此书不再对外展示',
            confirmColor: '#F56C6C'
        })
        if (!res.confirm) return

        wx.showLoading({ title: '处理中...' })
        try {
            await bookAPI.withdrawBook(id)
            wx.showToast({ title: '已下架' })
            this.loadMyBooks()
        } finally {
            wx.hideLoading()
        }
    }
})
